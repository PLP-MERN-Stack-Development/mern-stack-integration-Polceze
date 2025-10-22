// posts.js - Routes for blog posts

const express = require('express');
const {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
} = require('../controllers/postController');
// const { protect } = require('../middleware/authMiddleware'); // Will be added later

const router = express.Router();

// Public routes
router.route('/')
  .get(getPosts)
  // .post(protect, createPost); // Use 'protect' middleware after Auth is set up

// Temporarily allow POST without protect for initial testing
router.route('/').post(createPost); 

router.route('/:id')
  .get(getPost)
  // .put(protect, updatePost)
  // .delete(protect, deletePost);

// Temporarily allow PUT/DELETE without protect for initial testing
router.route('/:id')
  .put(updatePost)
  .delete(deletePost);

module.exports = router;