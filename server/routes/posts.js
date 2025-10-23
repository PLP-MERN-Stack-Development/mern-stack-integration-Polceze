// posts.js - Routes for blog posts

const express = require('express');
const {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
} = require('../controllers/postController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.route('/')
  .get(getPosts)
  .post(protect, authorize('admin', 'author'), createPost); // PROTECTED

router.route('/:id')
  .get(getPost)
  .put(protect, authorize('admin', 'author'), updatePost) // PROTECTED
  .delete(protect, authorize('admin', 'author'), deletePost); // PROTECTED

module.exports = router;