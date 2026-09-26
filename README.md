# Crop Connect

Crop Connect is a direct farmer-to-customer marketplace built with Node.js, Express, MongoDB, and vanilla JavaScript.

## Features
- Farmer and customer registration/login
- JWT-based authentication with role-based access
- Product browsing, search, filtering, and sorting
- Product details and farmer profiles
- Cart, checkout, and multi-farmer order splitting
- Farmer dashboards and product management
- Order status tracking
- Reviews and ratings
- Wishlist, notifications, and complaint-ready architecture
- Responsive UI for mobile and desktop

## Tech Stack
- Backend: Node.js, Express.js
- Database: MongoDB + Mongoose
- Auth: JWT + bcryptjs
- File uploads: Multer
- Security: Helmet, CORS, rate limiting
- Frontend: HTML5, CSS3, Vanilla JavaScript

## Project Structure
```text
crop-connect/
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── seed.js
│   ├── server.js
│   └── utils/
├── public/
│   ├── css/
│   ├── js/
│   ├── images/
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   ├── products.html
│   ├── product-details.html
│   ├── cart.html
│   ├── checkout.html
│   ├── orders.html
│   ├── profile.html
│   └── farmer/
├── uploads/
├── .env.example
├── .gitignore
├── package.json
├── README.md
└── server.js
```

## Installation
```bash
npm install
cp .env.example .env
```

## Environment variables
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/cropconnect
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:5000
```

## Run the app
```bash
npm run dev
```

Open http://localhost:5000

## Seed data
```bash
npm run seed
```

This creates sample farmers, customers, products, and orders for testing.

## Default development accounts
After seeding, use these accounts:
- Admin: admin@cropconnect.com / admin123
- Customer: customer1@cropconnect.com / customer123
- Farmer: farmer1@cropconnect.com / farmer123

## Notes
- This project is built for local development and can be extended with admin pages and payment integration later.
- Uploaded product images are saved under the uploads folder.

## API overview
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me
- GET /api/products
- GET /api/products/:id
- POST /api/products
- PUT /api/products/:id
- DELETE /api/products/:id
- GET /api/cart
- POST /api/cart
- PUT /api/cart/:productId
- DELETE /api/cart/:productId
- POST /api/orders
- GET /api/orders
- GET /api/orders/:id
- PUT /api/orders/:id/status
- POST /api/reviews
- GET /api/reviews/product/:productId
- GET /api/users/profile
- PUT /api/users/profile
```
