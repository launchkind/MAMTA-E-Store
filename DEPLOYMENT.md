# Deployment Guide

This guide explains how to deploy the production-ready applications for the **Entry E-commerce Platform**. The backend (API), storefront (Web), and admin panel (Admin) will be deployed separately.

We recommend deploying the frontend applications to platforms like **Vercel** or **Netlify**, and the API to **Render**, **Railway**, or an **AWS/DigitalOcean** VPS.

---

## 1. Deploying the Backend API (`apps/api`)

The API requires a persistent backend and environment variables (MongoDB, Stripe, JWT). We'll use **Render** as a common example.

1. Create an account on [Render](https://render.com/).
2. Click **New +** and select **Web Service**.
3. Connect your GitHub repository and select the `entry-ecommerce` repository.
4. Setup the configuration:
   - **Name**: `entry-api`
   - **Root Directory**: `apps/api`
   - **Environment**: `Node`
   - **Build Command**:
     Since this is a Turborepo, the easiest way is to let Render install everything from the root, but scope to the API. Use this bash command:
     ```bash
     cd ../../ && pnpm install && pnpm filter @entry/api build
     ```
     _Alternatively, if you use a standalone deployment script, run `npm run build` or `pnpm build` inside the api folder depending on your setup._
   - **Start Command**: `node dist/server.js` (Or whatever your compiled Express server file is).
5. **Environment Variables**: Add all the variables from your local `apps/api/.env`.
   - Update `WEB_URL` to your production frontend domain (e.g. `https://your-store.com`).
   - Update `ADMIN_URL` to your production admin domain (e.g. `https://admin.your-store.com`).
   - Ensure your Stripe variables use production keys, not `pk_test`/`sk_test`.
6. Click **Deploy Web Service**.

---

## 2. Deploying the Customer Storefront (`apps/web`)

Vercel provides the easiest deployment path for Next.js applications and has supreme support for Turborepo architectures.

1. Create a [Vercel](https://vercel.com/) account and link your GitHub.
2. Click **Add New** -> **Project**.
3. Import the `entry-ecommerce` repository.
4. **Configure the Project**:
   - **Project Name**: `entry-storefront`
   - **Framework Preset**: `Next.js`
   - **Root Directory**: Edit this and select `apps/web`.
5. **Environment Variables**: Open your local `apps/web/.env` and copy them into Vercel.
   - Update `NEXT_PUBLIC_API_URL` to the live URL of the API you just deployed (e.g., `https://entry-api.onrender.com`).
   - Update `NEXT_PUBLIC_APP_URL` to your Vercel deployment domain.
6. Click **Deploy**. Vercel will automatically recognize the Turborepo workspace and build the shared packages (`@entry/ui`, etc) along with the Next.js app.

---

## 3. Deploying the Admin Dashboard (`apps/admin`)

The Vite admin interface is a static Single Page Application (SPA). It can also be easily deployed to Vercel.

1. Follow the exact same Vercel steps as above (Add New -> Project -> Import Repository).
2. **Configure the Project**:
   - **Project Name**: `entry-admin`
   - **Framework Preset**: `Vite`
   - **Root Directory**: Edit this and select `apps/admin`.
3. **Environment Variables**: Add your production variables.
   - `VITE_API_URL` should point to your live backend (e.g., `https://entry-api.onrender.com`).
4. Click **Deploy**.

---

## Post-Deployment Checklist

- [ ] **Test Backend Connectivity:** Go to your live Storefront and Admin URLs. Can you create an account, log in, or fetch products?
- [ ] **CORS Settings:** Ensure that `WEB_URL` and `ADMIN_URL` on your live API server match the exact deployed domains of your Vercel projects. If CORS is failing, double-check these logs.
- [ ] **Stripe Webhooks:**
      Go to your live Stripe Dashboard -> Developers -> Webhooks. Add an endpoint pointing to `https://entry-api.onrender.com/api/payment/webhook`.
      Copy the _Webhook Signing Secret_ and put it as `STRIPE_WEBHOOK_SECRET` in your Live API environment variables.
- [ ] **Create Production Admin:** Register a new user on your live storefront, then directly access MongoDB Atlas and change that user's role to `admin` so you can login to the production Admin Dashboard.
