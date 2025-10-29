// commentController.js - Controller for handling comments

const Post = require('../models/Post');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Add a comment to a post
// @route   POST /api/posts/:postId/comments
// @access  Private (Requires authentication)
exports.addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;

    // 1. Basic Validation
    if (!content) {
      return res.status(400).json({ success: false, error: 'Comment content is required.' });
    }

    // 2. Find the post
    const post = await Post.findById(postId);

    if (!post) {
      return next(new ErrorResponse(`Post not found with id/slug of ${id}`, 404));
    }

    // 3. Create the new comment object
    const newComment = {
      user: req.user.id, // ID from the protect middleware (req.user)
      content: content,
      // createdAt is handled by the default value in the Mongoose schema
    };

    // 4. Push the comment to the post's comments array and save
    post.comments.push(newComment);
    await post.save();

    // 5. Populate the user field for the newly added comment before responding
    // Get the last comment (the one we just added)
    const savedComment = post.comments[post.comments.length - 1];
    await savedComment.populate('user', 'username'); 

    res.status(201).json({ 
      success: true, 
      data: savedComment,
      message: 'Comment added successfully.'
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to add comment.' });
  }
};

// NOTE: You would add exports.deleteComment and exports.updateComment here later for full CRUD.