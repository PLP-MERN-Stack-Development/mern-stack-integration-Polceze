const Category = require('../models/Category');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.status(200).json({ success: true, count: categories.length, data: categories });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new category
// @route   POST /api/categories
// @access  Private (e.g., Admin/Editor only)
exports.createCategory = async (req, res, next) => {
  try {
    // Input validation (e.g., check if 'name' is in req.body)
    if (!req.body.name) {
      return next(new ErrorResponse('Please provide a category name', 400));
    }

    const category = await Category.create(req.body);
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    // Handle duplicate key error (unique slug/name)
    if (error.code === 11000) {
      return next(new ErrorResponse('Category already exists', 400));
    }
    next(error);
  }
};