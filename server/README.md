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

2. In another terminal, start the frontend:

   ```bash
   npm run client
   ```

3. Or run both simultaneously:

   ```bash
   npm run dev & npm run client
   ```

The application will be available at `http://localhost:3000` for the frontend and `http://localhost:5000` for the backend API.

## API Endpoints

### Auth

- POST /api/auth/register
- POST /api/auth/login

### Products

- GET /api/products
- GET /api/products/:id
- POST /api/products (Admin)
- PUT /api/products/:id (Admin)
- DELETE /api/products/:id (Admin)

### Cart

- GET /api/cart
- POST /api/cart
- PUT /api/cart/:productId
- DELETE /api/cart/:productId

### Orders

- POST /api/orders
- GET /api/orders/my
- GET /api/orders (Admin)
- PUT /api/orders/:id/status (Admin)

## Project Structure

```
mern-ecommerce/
├── server/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── auth.js
│   │   ├── product.js
│   │   ├── cart.js
│   │   └── order.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── validation.js
│   │   └── error.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Product.js
│   │   └── Order.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── product.js
│   │   ├── cart.js
│   │   └── order.js
│   ├── seed/
│   │   └── seed.js
│   └── server.js
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   └── Header.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Products.jsx
│   │   │   ├── ProductDetail.jsx
│   │   │   ├── Cart.jsx
│   │   │   ├── Checkout.jsx
│   │   │   ├── Orders.jsx
│   │   │   └── AdminDashboard.jsx
│   │   ├── redux/
│   │   │   ├── store.js
│   │   │   └── slices/
│   │   │       ├── authSlice.js
│   │   │       ├── productSlice.js
│   │   │       ├── cartSlice.js
│   │   │       └── orderSlice.js
│   │   ├── utils/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
├── .env
├── package.json
└── README.md
```

## License

MIT
