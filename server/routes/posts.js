const express = require('express');
const {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
} = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

const router = express.Router();

router.route('/')
  .get(getPosts)
  .post(protect, upload.single('featuredImage'), createPost);

router.route('/:id')
  .get(getPost)
  .put(protect, upload.single('featuredImage'), updatePost)
  .delete(protect, deletePost);

module.exports = router;