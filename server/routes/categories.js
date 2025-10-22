const express = require('express');
const {
  getCategories,
  createCategory,
} = require('../controllers/categoryController');
// const { protect, authorize } = require('../middleware/authMiddleware'); 

const router = express.Router();

router.route('/')
  .get(getCategories)
  // .post(protect, authorize('admin', 'editor'), createCategory); 

// Temporarily allow POST without protect for initial testing
router.route('/').post(createCategory);

module.exports = router;