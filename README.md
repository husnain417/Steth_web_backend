# Steth E-Commerce Backend

A comprehensive backend API for the Steth E-Commerce website built with Node.js, Express, and MongoDB.

## Features

- **User Management**: Authentication, authorization, and profile management
- **Product Management**: CRUD operations for products with inventory management
- **Order Management**: Complete order lifecycle with payment processing
- **Student Verification**: Student discount verification system
- **Image Management**: ImageKit integration for file uploads
- **Email Services**: Automated email notifications
- **Reward Points**: Customer loyalty program

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **File Storage**: ImageKit
- **Authentication**: JWT
- **Email**: Nodemailer
- **File Upload**: Multer

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# ImageKit Configuration
IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_URL_ENDPOINT=your_imagekit_url_endpoint

# Database
MONGODB_URI=your_mongodb_connection_string

# JWT
JWT_SECRET=your_jwt_secret

# Email (Gmail)
EMAIL_USER=your_gmail_address
EMAIL_PASS=your_gmail_app_password

# Server
PORT=5000
NODE_ENV=development
```

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables
4. Start the server:
   ```bash
   npm run dev  # Development mode
   npm start    # Production mode
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/google` - Google OAuth login

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/profile-picture` - Update profile picture

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Orders
- `POST /api/orders/create` - Create order (Authenticated)
- `POST /api/orders/create-guest` - Create guest order
- `GET /api/orders/my-orders` - Get user orders
- `GET /api/orders/all` - Get all orders (Admin)

### Student Verification
- `POST /api/student-verification/submit` - Submit verification
- `GET /api/student-verification/status` - Check status

## File Storage

This project uses **ImageKit** for file storage and image management. All images (product images, user profile pictures, student verification documents, etc.) are uploaded to ImageKit with organized folder structures:

- `user-profiles/` - User profile pictures
- `products/` - Product images
- `student-verification/` - Student verification documents
- `hero-images/` - Hero/banner images
- `color-tiles/` - Color swatch images
- `order-payment/` - Payment receipts

## Migration from Cloudinary

This project has been migrated from Cloudinary to ImageKit. The migration includes:

- Updated all upload utilities
- Modified database schemas to use ImageKit file IDs
- Updated all controllers to use ImageKit API
- Maintained the same folder structure for organization

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License 