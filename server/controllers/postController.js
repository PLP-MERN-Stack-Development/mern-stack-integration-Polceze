// postController.js - Controllers for blog post routes

const Post = require('../models/Post');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all posts
// @route   GET /api/posts
// @access  Public
exports.getPosts = async (req, res, next) => {
  try {
    console.log('=== GET POSTS WITH MODEL CHECK ===');
    
    // Check if Post model is available
    if (!Post || typeof Post.find !== 'function') {
      console.error('Post model is not properly initialized');
      return res.status(200).json({
        success: true,
        count: 0,
        pagination: { page: 1, limit: 10, totalPages: 0, totalPosts: 0 },
        data: [],
        message: 'System initializing'
      });
    }

    console.log('Post model is available, proceeding with query...');
    
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const posts = await Post.find({})
      .populate('author', 'username') 
      .populate('category', 'name slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalPosts = await Post.countDocuments({});

    res.status(200).json({ 
      success: true, 
      count: posts.length, 
      pagination: { 
        page: parseInt(page), 
        limit: parseInt(limit), 
        totalPages: Math.ceil(totalPosts / parseInt(limit)), 
        totalPosts 
      },
      data: posts 
    });
    
  } catch (error) {
    console.error('=== POSTS CONTROLLER ERROR ===', error);
    next(error);
  }
};

// @desc    Get single post by ID or slug
// @route   GET /api/posts/:id
// @access  Public
exports.getPost = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    console.log('=== GET POST CALLED ===');
    console.log('Requested ID/slug:', id);
    
    // Check if it's a valid ObjectId (24 character hex string)
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);
    
    let post;
    if (isObjectId) {
      // If it's a valid ObjectId, search by _id
      post = await Post.findOne({ _id: id })
        .populate('author', 'username')
        .populate('category', 'name slug');
    } else {
      // If it's not a valid ObjectId, search by slug
      post = await Post.findOne({ slug: id })
        .populate('author', 'username')
        .populate('category', 'name slug');
    }

    if (!post) {
      return next(new ErrorResponse(`Post not found with id/slug of ${id}`, 404));
    }

    // Increment view count (Method from Post.js)
    await post.incrementViewCount();
    
    console.log('Post found:', post.title);
    res.status(200).json({ success: true, data: post });
  } catch (error) {
    console.error('=== GET POST ERROR ===', error);
    next(error);
  }
};

// @desc    Create new post
// @route   POST /api/posts
// @access  Private (Requires authentication and authorization)
exports.createPost = async (req, res) => {
  try {
    console.log('=== CREATE POST STARTED ===');
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    console.log('Request user:', req.user);

    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      console.log('ERROR: No user found in request');
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const { title, content, category, excerpt, tags } = req.body;
    
    console.log('Extracted fields:', {
      title,
      content: content ? `Length: ${content.length} chars` : 'Missing',
      category,
      excerpt,
      tags
    });

    // MANUAL SLUG GENERATION
    const generateSlug = (title) => {
      return title
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim() + '-' + Date.now();
    };

    // Prepare post data WITH SLUG
    const postData = {
      title,
      content,
      category,
      excerpt,
      author: req.user.id,
      tags: Array.isArray(tags) ? tags : (tags || '').split(',').map(tag => tag.trim()).filter(tag => tag),
      featuredImage: req.file ? req.file.filename : 'default-post.jpg',
      slug: generateSlug(title) // MANUALLY SET SLUG
    };

    console.log('Post data before creation:', postData);

    // Create the post using new Post() instead of Post.create()
    console.log('Attempting to create post in database...');
    const post = new Post(postData);
    await post.save();
    
    console.log('=== POST CREATED SUCCESSFULLY ===');
    console.log('Post ID:', post._id);
    console.log('Post slug:', post.slug);
    
    res.status(201).json({
      success: true,
      data: post
    });

  } catch (error) {
    console.error('=== ERROR CREATING POST ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // If it's a validation error, log the specific fields
    if (error.name === 'ValidationError') {
      console.error('Validation errors:', error.errors);
    }
    
    res.status(400).json({
      success: false,
      error: error.message
    });
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
