# MERN E-Commerce Application

A production-style MERN Stack E-Commerce Application with clean architecture, proper authentication, role-based authorization, and a working cart & order flow.

## Features

- User registration and login
- Product browsing and details
- Shopping cart functionality
- Checkout and order placement
- Order tracking
- Admin dashboard for managing products and orders
- Role-based access control (Admin/User)
- JWT authentication
- Responsive UI with Material UI
- Redux Toolkit for state management

## Tech Stack

- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **Frontend**: React.js, Vite, Material UI, Redux Toolkit
- **Authentication**: JWT

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository

2. Install backend dependencies:

   ```bash
   npm install
   ```

3. Install frontend dependencies:

   ```bash
   cd client
   npm install
   cd ..
   ```

4. Create a `.env` file in the root directory with the following variables:

   ```
   MONGO_URI=mongodb://localhost:27017/mern-ecommerce
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   PORT=5000
   NODE_ENV=development
   ```

5. Seed the database with admin user and sample products:

   ```bash
   npm run seed
   ```

   Admin credentials:
   - Email: admin@example.com
   - Password: 123456

### Running the Application

1. Start the backend server:

   ```bash
   npm run dev
   ```

2. Start the frontend:

   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:3000` for the frontend and `http://localhost:5000` for the backend API.

.env

MONGO_URI=mongodb+srv://aarfeenshahzed33_db_user:ceYB5vW9XHpZdBB0@cluster0.owhr2cx.mongodb.net/
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=5000
NODE_ENV=development

## License

MIT
