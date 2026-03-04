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
- **JWT Refresh Token Authentication** (Access Token: 15min, Refresh Token: 7 days)
- Automatic token refresh on the client
- Logout and logout from all devices
- Responsive UI with Material UI
- Redux Toolkit for state management

## Tech Stack

- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **Frontend**: React.js, Vite, Material UI, Redux Toolkit
- **Authentication**: JWT with Refresh Token Rotation

## Authentication System

This application implements a production-level refresh token authentication system:

### How It Works

1. **Login/Register**: User receives both an access token (short-lived: 15 minutes) and a refresh token (long-lived: 7 days)
2. **Access Token**: Used for all API requests, included in the Authorization header as `Bearer <token>`
3. **Automatic Refresh**: When the access token expires, the client automatically uses the refresh token to get a new access token
4. **Token Rotation**: Each refresh generates a new refresh token (security best practice)
5. **Logout**: Invalidates the refresh token on the server
6. **Logout All Devices**: Invalidates all refresh tokens for the user

### Security Features

- Refresh tokens are hashed before storage (SHA-256)
- Access tokens are short-lived (15 minutes by default)
- Refresh tokens expire after 7 days
- Token rotation on each refresh prevents token reuse attacks
- Automatic logout and redirect to login on refresh failure

### API Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| POST | `/api/auth/refresh` | Refresh access token | No |
| POST | `/api/auth/logout` | Logout (invalidate token) | No |
| POST | `/api/auth/logout-all` | Logout from all devices | Yes |
| GET | `/api/auth/me` | Get current user | Yes |

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

4. Create a `.env` file in the `server` directory:

   ```bash
   cp server/.env.example server/.env
   ```

5. Create a `.env` file in the `client` directory (optional):

   ```bash
   cp client/.env.example client/.env
   ```

6. Configure environment variables in `server/.env`:

   ```
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/mern-ecommerce
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_ACCESS_EXPIRE=15m
   ```

7. Seed the database with admin user and sample products:

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

2. Start the frontend (in a new terminal):

   ```bash
   npm run client
   ```

The application will be available at:
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000`

## Project Structure

```
EcomShop/
├── server/
│   ├── src/
│   │   ├── config/         # Database configuration
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/     # Auth, validation, error handling
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # API routes
│   │   ├── types/          # TypeScript types
│   │   ├── utils/          # Token utilities
│   │   └── server.ts       # Entry point
│   ├── .env.example
│   └── package.json
└── client/
    ├── src/
    │   ├── components/     # React components
    │   ├── hooks/          # Custom React hooks
    │   ├── pages/          # Page components
    │   ├── redux/          # Redux store and slices
    │   ├── utils/          # API client with interceptors
    │   └── types/          # TypeScript types
    ├── .env.example
    └── package.json
```

## Environment Variables

### Server (.env)

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | - |
| `JWT_SECRET` | Secret key for JWT signing | - |
| `JWT_ACCESS_EXPIRE` | Access token expiry | `15m` |
| `JWT_EXPIRE` | Refresh token expiry | `7d` |

### Client (.env)

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:5000` |

## Production Deployment

### Security Recommendations

1. **Use strong JWT secrets**: Generate a random 64+ character string
2. **Enable HTTPS**: Always use HTTPS in production
3. **Set secure cookie flags**: If using cookies for tokens
4. **Configure CORS**: Restrict allowed origins
5. **Use environment variables**: Never commit secrets to version control
6. **Enable rate limiting**: Already configured (100 requests per 10 minutes)
7. **Use Helmet.js**: Security headers already enabled

## License

MIT
