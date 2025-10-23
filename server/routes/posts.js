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
const upload = require('../middleware/upload');

const router = express.Router();

// Public routes
router.route('/')
  .get(getPosts)
  // Use upload.single('featuredImage') middleware before createPost
  .post(protect, authorize('admin', 'author'), upload.single('featuredImage'), createPost); 

router.route('/:id')
  .get(getPost)
  // Use upload.single('featuredImage') middleware before updatePost
  .put(protect, authorize('admin', 'author'), upload.single('featuredImage'), updatePost) 
  .delete(protect, authorize('admin', 'author'), deletePost); 

module.exports = router;