const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const multer = require('multer'); // Add this import
require('dotenv').config();

const productRoutes = require('./routes/product.routes');
const userRoutes = require('./routes/user.routes');
const studentVerificationRoutes = require('./routes/studentVerification.routes');
const orderRoutes = require('./routes/order.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const contactRoutes = require('./routes/contact.routes');
const heroImageRoutes = require('./routes/heroImageRoutes');
const colorTileRoutes = require('./routes/colorTileRoutes');
const subscriberRoutes = require('./routes/subscriberRoutes');

const app = express();

// Create folder if it doesn't exist
const ensureDirectoryExists = (directory) => {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
};

// Ensure uploads directory exists
ensureDirectoryExists(path.join(__dirname, 'uploads'));
// Ensure temp directory exists for file uploads
ensureDirectoryExists(path.join(__dirname, 'temp'));

// IMPORTANT: Increase payload limits for large file uploads (BEFORE other middleware)
app.use(express.json({ 
  limit: '50mb',
  extended: true 
}));
app.use(express.urlencoded({ 
  limit: '50mb',
  extended: true,
  parameterLimit: 50000
}));

// Set timeout for requests (important for large file uploads)
app.use((req, res, next) => {
  // Set timeout to 5 minutes for file uploads
  req.setTimeout(300000); // 5 minutes
  res.setTimeout(300000); // 5 minutes
  next();
});

// CORS configuration
app.use(cors());  // Allow all origins during development

// Modify your helmet configuration to properly allow images from your origin
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      "img-src": ["'self'", "data:", "http://localhost:5000", "http://localhost:3000", "res.cloudinary.com"]
    }
  },
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(morgan('dev'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rate limiting (commented out for development)
// const limiter = rateLimit({
//     windowMs: 15 * 60 * 1000, // 15 minutes
//     max: 100 // limit each IP to 100 requests per windowMs
// });
// app.use(limiter);

// Routes
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/student-verification', studentVerificationRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/hero-images', heroImageRoutes);
app.use('/api/color-tiles', colorTileRoutes);
app.use('/api/subscribers', subscriberRoutes);

// Enhanced error handling middleware for file uploads
app.use((error, req, res, next) => {
  console.error('Server Error:', error);

  // Handle Multer errors
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum file size is 10MB.'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum 10 files allowed.'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected file field.'
      });
    }
  }

  // Handle file filter errors
  if (error.message === 'Only image files are allowed!') {
    return res.status(400).json({
      success: false,
      message: 'Only image files are allowed.'
    });
  }

  // Handle Cloudinary errors
  if (error.message.includes('Cloudinary') || error.http_code) {
    return res.status(500).json({
      success: false,
      message: 'Error uploading images to cloud storage',
      error: error.message
    });
  }

  // Handle JSON parsing errors
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON format'
    });
  }

  // Generic server error
  console.error(error.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

app.get("/", (req, res) => {
  res.send("Backend is working!");
});

app.get('/ping', (req, res) => {
  res.send('pong');
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`File upload limit: 50MB`);
    console.log(`Request timeout: 5 minutes`);
});