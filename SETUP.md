# Setup Guide & Credentials

Welcome to the **Entry E-commerce Platform**. To get your storefront, admin dashboard, and backend running locally, follow these steps closely.

---

## 1. Prerequisites

Before starting, ensure you have the following installed on your machine:

- **Node.js**: `v18.0.0` or higher
- **pnpm**: `v8.x` or higher (`npm i -g pnpm`)
- **Git**: For version control
- **MongoDB**: A running local MongoDB instance OR a [MongoDB Atlas](https://www.mongodb.com/atlas) cluster URL.

## 2. Installation

Extract the downloaded `entry-ecommerce.zip` file, open your terminal, and navigate into the extracted root directory:

```bash
cd entry-ecommerce
pnpm install
```

When you run `pnpm install`, Turborepo will automatically link the shared packages (`@entry/ui`, `@entry/config`, `@entry/types`) so they are available to all apps.

## 3. Environment Variables Configuration

You must set up environment variables for the three core applications: **API**, **Admin**, and **Web**.

In each module, you will find a `.env.example` file. Copy the contents of these files into a new `.env` file in the same directory.

### A. Backend API (`apps/api/.env`)

This is the brain of your application. Navigate to `apps/api/` and create your `.env` file:

```env
# Server Port
PORT=8000
NODE_ENV=development

# MongoDB Connection String (Replace with your Atlas string or Localhost)
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.exmpl.mongodb.net/entryDB

# JWT Authentication Secrets (Generate strong random strings for these)
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_SECRET=your_super_secret_refresh_key
REFRESH_TOKEN_EXPIRES_IN=30d

# Stripe Payment Keys (Get these from your Stripe Dashboard -> Developers -> API Keys)
STRIPE_SECRET_KEY=sk_test_your_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Upload Provider (e.g. Cloudinary)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Admin Dashboard Frontend URL (Used for CORS)
ADMIN_URL=http://localhost:5173
# Customer Web Frontend URL (Used for CORS)
WEB_URL=http://localhost:3000
```

### B. Customer Storefront (`apps/web/.env`)

Navigate to `apps/web/` and create your `.env` file:

```env
# Environment
NODE_ENV=development

# API URL
NEXT_PUBLIC_API_URL=http://localhost:8000

# Stripe Public Key (For checking out)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key

# Public URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### C. Admin Dashboard (`apps/admin/.env`)

Navigate to `apps/admin/` and create your `.env` (or `.env.local` for Vite) file:

```env
# Environment
NODE_ENV=development

# API URL
VITE_API_URL=http://localhost:8000
```

## 4. Where to get the Credentials

1. **MongoDB URI**: Sign up at [MongoDB Atlas](https://www.mongodb.com/atlas), create a free tier cluster, click "Connect -> Connect your application", and copy the connection string. Replace `<password>` with your database user's password.
2. **Stripe Keys**: Sign up for a [Stripe Account](https://stripe.com/). Go to Developers -> API Keys. Your "Publishable key" goes to `apps/web`, and your "Secret key" goes to `apps/api`.
3. **Cloudinary Keys**: Sign up for [Cloudinary](https://cloudinary.com/). Go to your dashboard to find your Cloud Name, API Key, and API Secret.
4. **JWT Secrets**: You can use a password generator or run `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` in your terminal to create secure, random keys.

## 5. Starting the Development Servers

Once all `.env` files are created and populated, return to the root folder `entry-ecommerce`.

You can start all services simultaneously using Turborepo:

```bash
pnpm dev
```

This command runs Next.js (Web), Vite (Admin), and Express (API) at the same time:

- **Customer Web**: http://localhost:3000
- **Admin Dashboard**: http://localhost:5173
- **API Server**: http://localhost:8000

---

## 6. Accessing the Admin Dashboard

By default, to access your admin dashboard, you may need an Admin account.
If your database is empty, you can either:

1. Register a new user via the API/Web, then manually change their `role` to `admin` directly inside MongoDB Compass or Atlas.
2. Use the data-migration script (if provided in `scripts/`) to seed a default admin user.

You are now ready to start configuring your store!
