// server/routes/categories.js
const express = require('express');
const {
  getCategories,
  createCategory,
} = require('../controllers/categoryController');
// const { protect, authorize } = require('../middleware/authMiddleware'); 

const router = express.Router();

router.route('/')
  .get(getCategories)
  .post(createCategory); // Temporarily remove auth for testing

module.exports = router;