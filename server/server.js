// server.js - Main server file for the MERN blog application

// Import required modules
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const ErrorResponse = require('./utils/errorResponse');

// Import routes
const postRoutes = require('./routes/posts');
const categoryRoutes = require('./routes/categories');
const authRoutes = require('./routes/auth');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Log requests in development mode
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
  });
}

// Add this to server.js before your routes
app.get('/api/debug/imports', (req, res) => {
  try {
    const postController = require('./controllers/postController');
    const authMiddleware = require('./middleware/authMiddleware');
    const upload = require('./middleware/upload');
    
    const imports = {
      postController: {
        getPosts: typeof postController.getPosts,
        createPost: typeof postController.createPost,
        updatePost: typeof postController.updatePost,
        deletePost: typeof postController.deletePost
      },
      authMiddleware: {
        protect: typeof authMiddleware.protect,
        authorize: typeof authMiddleware.authorize
      },
      upload: {
        single: typeof upload.single
      }
    };
    
    console.log('Import check:', imports);
    res.json(imports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API routes
app.use('/api/posts', postRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/auth', authRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('MERN Blog API is running');
});

// Error handling middleware (Must be the last middleware defined)
app.use((err, req, res, next) => {
  let error = { ...err }; // Copy the error object
  error.message = err.message; // Ensure the message is copied

  // Log error stack for debugging
  console.error(err.stack);

  // If the error is a custom ErrorResponse, use its status code
  if (err.statusCode) {
    error.statusCode = err.statusCode;
  } else if (err.name === 'CastError') {
    // Mongoose bad ObjectId error (e.g., Cast to ObjectId failed for "lifestyle")
    const message = `Resource not found / Invalid ID for value ${err.value}`;
    error = new ErrorResponse(message, 404);
  } else if (err.code === 11000) {
    // Mongoose duplicate key error 
    const message = 'Duplicate field value entered';
    error = new ErrorResponse(message, 400);
  } else if (err.name === 'ValidationError') {
    // Mongoose validation error (e.g., missing required field, like title/content)
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = new ErrorResponse(message, 400);
  }
  
  // Respond with the determined status code and error message
  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error',
  });
});

// Connect to MongoDB and start server
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  });

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  // Close server & exit process
  process.exit(1);
});

// Add this temporary debug route to server.js
app.get('/api/debug/posts', async (req, res) => {
  try {
    console.log('=== DEBUG POSTS ROUTE ===');
    
    // Test direct MongoDB connection
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));
    
    // Test if posts collection exists and has documents
    const postCount = await db.collection('posts').countDocuments();
    console.log('Posts count via native driver:', postCount);
    
    res.json({ 
      collections: collections.map(c => c.name),
      postCount,
      mongooseModel: typeof Post
    });
    
  } catch (error) {
    console.error('Debug route error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = app; 