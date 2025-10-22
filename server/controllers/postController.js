// postController.js - Controllers for blog post routes

const Post = require('../models/Post');
const ErrorResponse = require('../utils/errorResponse'); // Assuming you have this utility

// @desc    Get all posts
// @route   GET /api/posts
// @access  Public
exports.getPosts = async (req, res, next) => {
  // Task 5: Implement pagination, searching, and filtering here
  try {
    const posts = await Post.find({})
      .populate('author', 'username') // Only show username from User model
      .populate('category', 'name slug')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: posts.length, data: posts });
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
    // Add the authenticated user as the author
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
    let post = await Post.findById(req.params.id);

    if (!post) {
      return next(new ErrorResponse(`Post not found with id of ${req.params.id}`, 404));
    }

    // Authorization check: Make sure the logged-in user is the post author
    // if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
    //   return next(new ErrorResponse(`Not authorized to update this post`, 401));
    // }

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