// postController.js - Controllers for blog post routes

const Post = require('../models/Post');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all posts
// @route   GET /api/posts
// @access  Public
exports.getPosts = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, category, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    let query = {};

    // 1. Filtering by Category (using category name/slug or ID)
    if (category) {
        // We assume 'category' is the Category ID for the Post model's ref
        query.category = category; 
    }
    
    // 2. Searching
    if (search) {
        query.$or = [
            // Case-insensitive search on title and content
            { title: { $regex: search, $options: 'i' } },
            { content: { $regex: search, $options: 'i' } },
            { tags: { $in: [new RegExp(search, 'i')] } } // Search within tags
        ];
    }

    const totalPosts = await Post.countDocuments(query);
    const totalPages = Math.ceil(totalPosts / parseInt(limit));

    const posts = await Post.find(query)
      .populate('author', 'username') 
      .populate('category', 'name slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({ 
        success: true, 
        count: posts.length, 
        pagination: { page: parseInt(page), limit: parseInt(limit), totalPages, totalPosts },
        data: posts 
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single post by ID or slug
// @route   GET /api/posts/:id
// @access  Public
exports.getPost = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Find by ID or by slug
    const post = await Post.findOne({ $or: [{ _id: id }, { slug: id }] })
      .populate('author', 'username')
      .populate('category', 'name slug');

    if (!post) {
      return next(new ErrorResponse(`Post not found with id/slug of ${id}`, 404));
    }

    // Increment view count (Method from Post.js)
    await post.incrementViewCount();
    
    res.status(200).json({ success: true, data: post });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new post
// @route   POST /api/posts
// @access  Private (Requires authentication and authorization)
exports.createPost = async (req, res, next) => {
  // Note: Assuming you'll add authentication middleware to get req.user
  try {
    if (req.file) {
        // Save the path to the database field
        req.body.featuredImage = req.file.filename; 
    }

    req.body.author = req.user._id; 
    
    const post = await Post.create(req.body);
    res.status(201).json({ success: true, data: post });
  } catch (error) {
    next(error);
  }
};

// @desc    Update post
// @route   PUT /api/posts/:id
// @access  Private
exports.updatePost = async (req, res, next) => {
  try {
    let post = await Post.findById(req.params.id).select('+featuredImage');

    if (!post) {
      return next(new ErrorResponse(`Post not found with id of ${req.params.id}`, 404));
    }

    // Authorization check: Make sure the logged-in user is the post author
    if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse(`Not authorized to update this post`, 401));
    }

    // Handle new file upload
    if (req.file) {
        // Delete old file if it exists and isn't the default
        if (post.featuredImage && post.featuredImage !== 'default-post.jpg') {
            const oldImagePath = path.join(__dirname, '../uploads', post.featuredImage);
            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }
        }
        // Update the featuredImage field with the new file path
        req.body.featuredImage = req.file.filename;
    }

    post = await Post.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: post });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete post
// @route   DELETE /api/posts/:id
// @access  Private
exports.deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return next(new ErrorResponse(`Post not found with id of ${req.params.id}`, 404));
    }
    
    // Authorization check
    // if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
    //   return next(new ErrorResponse(`Not authorized to delete this post`, 401));
    // }

    await post.deleteOne(); // Use deleteOne() on the Mongoose document

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};