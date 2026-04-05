# ShopVintage — E-Commerce Application

A full-stack e-commerce web application for browsing and reviewing unique items across five categories: **Vinyls**, **Antique Furniture**, **GPS Sport Watches**, **Running Shoes**, and **Camping Tents**.

## 🔗 Live Deployment

> **Vercel URL:** _(add your Vercel deployment URL here)_

---

## 📖 How to Use the Application

### Login Credentials

All seeded accounts share the same password: **`test`**

| Username      | Password | Role    | Email                  |
|---------------|----------|---------|------------------------|
| `testadmin`   | `test`   | Admin   | admin@shopvintage.com  |
| `alice`       | `test`   | User    | alice@example.com      |
| `bob`         | `test`   | User    | bob@example.com        |
| `charlie`     | `test`   | User    | charlie@example.com    |

### Logging In

1. Navigate to the application URL. You will be redirected to the **Login page** (`/login`).
2. Enter the **username** and **password** from the table above.
3. Click **Sign In** to access the store.
4. You can also create a new account by clicking **Sign Up** and filling in a username, email, and password.

### Regular User Features

- **Browse Products:** View all items on the home page. Use **category filter buttons** (All, Vinyls, Antique Furniture, GPS Sport Watches, Running Shoes, Camping Tents) to filter products.
- **View Item Details:** Click on any product card to see its full details, including price, seller, condition, and current average rating.
- **Rate Items:** On the item detail page, click the stars (1–5) to submit or update your rating. The item's average rating recalculates in real time.
- **Review Items:** Write a text review on the item detail page. You can edit or delete your review after submission.
- **Shopping Cart:** Click **"Add to Cart"** on any product card. Click the **🛒 Cart** button in the header to view your cart, see the total, and clear it.
- **My Account:** Click **"My Account"** in the header to view your profile, your average rating given, and all reviews you have written.

### Admin User Features

1. Log in with the admin credentials (`testadmin` / `test`).
2. An **"Admin"** button appears in the header. Click it to enter the Admin Panel.
3. **Dashboard:** Overview of the admin panel with navigation links.
4. **Items Management (`/admin/items`):**
   - View all items in a sortable table with name, category, price, seller, and rating.
   - **Add Item:** Click "+ Add Item" to open the form. Fill in the details (category-specific fields like age, material, battery, size appear based on the selected category). Submit to add a new item.
   - **Delete Item:** Click "Delete" next to any item. This also cleans up all associated ratings/reviews and recalculates affected users' statistics.
5. **Users Management (`/admin/users`):**
   - View all users in a table with username, email, and role.
   - **Add User:** Click "+ Add User" to create a new user with a specific role (user/admin).
   - **Delete User:** Click "Delete" next to any user. This cascades — all their ratings and reviews are removed, and affected items' averages are recalculated.

### Seeding the Database

To populate the database with sample data, visit the seed endpoint:

```
GET /api/seed
```

This creates: 4 users (1 admin + 3 regular), 15 items (3 per category), and 45 ratings + 45 reviews (each user reviews every item). The endpoint is idempotent — running it multiple times will not create duplicates.

---

## 🏗️ Architecture & Design Decisions

### Programming Language & Frameworks

| Technology | Rationale |
|---|---|
| **TypeScript** | Provides static type checking across the full stack, catching bugs at compile time and improving developer experience with autocompletion and type safety. |
| **Next.js 16 (App Router)** | Chosen as the React-based full-stack framework because it provides: (1) API Routes (Route Handlers) that eliminate the need for a separate backend server, (2) file-system based routing for both pages and API endpoints, (3) excellent Vercel deployment support, and (4) modern React features (Server Components, `use()` hook). |
| **React 19** | The latest React version, leveraged for client-side interactivity with hooks (`useState`, `useEffect`) and the new `use()` API for unwrapping promises in components. |
| **MongoDB (via `mongodb` driver)** | A document-based NoSQL database chosen because the item data is polymorphic (each category has different attributes like `age`, `battery`, `material`, `size`). MongoDB's flexible schema handles this elegantly without needing complex table joins or nullable columns. We use **MongoDB Atlas** for cloud hosting. |
| **bcryptjs** | Industry-standard password hashing library. All user passwords are hashed with 10 salt rounds before storage — no plaintext passwords are ever persisted. |
| **Tailwind CSS 4** | Utility-first CSS framework for rapid, consistent UI development. Provides a modern, responsive design system without writing custom CSS. |

### General Architecture

```
┌───────────────────────────────────────────────────┐
│                   Client (Browser)                │
│  React Components • Client-side State (useState)  │
│  Auth: localStorage (username, email, role)       │
└───────────────┬───────────────────────────────────┘
                │  HTTP (fetch)
                ▼
┌───────────────────────────────────────────────────┐
│           Next.js API Routes (Server)             │
│                                                   │
│  /api/login        – POST auth login              │
│  /api/register     – POST create account          │
│  /api/admin/item   – GET/POST/DELETE items        │
│  /api/admin/user   – GET/POST/DELETE users        │
│  /api/rates/rating – GET/POST/PUT/DELETE ratings  │
│  /api/rates/reviews– GET/POST/PUT/DELETE reviews  │
│  /api/seed         – GET database seeder          │
│  /api/health       – GET health check             │
└───────────────┬───────────────────────────────────┘
                │  MongoDB Driver
                ▼
┌───────────────────────────────────────────────────┐
│              MongoDB Atlas (Cloud)                │
│                                                   │
│  Collections: users, items, ratings, reviews      │
└───────────────────────────────────────────────────┘
```

### Data Model

The application uses four MongoDB collections:

- **`users`** — `{ username, email, password (hashed), role ("user" | "admin") }`
- **`items`** — `{ category, name, desc, price, seller, image, condition, rating (avg), number_of_reviewers, ...category-specific fields }`
- **`ratings`** — `{ username, item_id (ObjectId), rating (1–5) }`
- **`reviews`** — `{ username, item_id (ObjectId), review (text), rating, created_at }`

### Key Design Decisions

1. **Polymorphic Items via MongoDB:** Different categories have unique attributes (e.g., `battery` for GPS watches, `material` for antique furniture). MongoDB's schemaless nature handles this without needing table-per-type or wide tables with many nullable columns that a relational database would require.

2. **Running Average for Ratings:** When a user submits/updates/deletes a rating, the item's `rating` field is recalculated immediately using an incremental formula rather than re-querying all ratings. This keeps reads fast (no aggregation needed on every page load).

3. **Cascading Deletes:** Deleting a user removes all their ratings and reviews, then recalculates affected items' averages. Similarly, deleting an item cleans up all associated ratings and recalculates affected users' statistics. This ensures data consistency throughout the application.

4. **Client-Side Authentication:** For simplicity, authentication stores user info (`username`, `email`, `role`) in `localStorage` after login. This is a demonstration approach — a production application would use JWT tokens or server-side sessions with HTTP-only cookies.

5. **Monorepo (Next.js Full-Stack):** Both the frontend and backend live in the same project. Next.js Route Handlers (in `src/app/api/`) serve as the REST API, eliminating the need for a separate Express/Fastify server and simplifying deployment.

6. **Idempotent Seeding:** The `/api/seed` endpoint checks for existing data before inserting, so it can be called multiple times safely without creating duplicates.

---

## 📂 Project Structure

```
ecommerce/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Home page (product grid + cart)
│   │   ├── layout.tsx                  # Root layout (fonts, metadata)
│   │   ├── globals.css                 # Global styles
│   │   ├── login/page.tsx              # Login / Sign-up page
│   │   ├── account/page.tsx            # User account dashboard
│   │   ├── item/[id]/page.tsx          # Item detail + rating + reviews
│   │   ├── admin/
│   │   │   ├── layout.tsx              # Admin layout with nav guard
│   │   │   ├── page.tsx                # Admin dashboard
│   │   │   ├── items/page.tsx          # Items CRUD management
│   │   │   └── users/page.tsx          # Users CRUD management
│   │   └── api/
│   │       ├── login/route.ts          # POST — authenticate user
│   │       ├── register/route.ts       # POST — create new user
│   │       ├── health/route.ts         # GET  — health check
│   │       ├── seed/route.ts           # GET  — seed database
│   │       ├── admin/
│   │       │   ├── item/route.ts       # GET/POST/DELETE — items
│   │       │   │   └── review_helper.ts
│   │       │   └── user/route.ts       # GET/POST/DELETE — users
│   │       │       └── user_helper.ts
│   │       └── rates/
│   │           ├── rating/route.ts     # GET/POST/PUT/DELETE — ratings
│   │           │   └── rating_helper.ts
│   │           └── reviews/route.ts    # GET/POST/PUT/DELETE — reviews
│   │               └── review_helper.ts
│   ├── components/
│   │   ├── CategoryFilter.tsx
│   │   ├── LoginModal.tsx
│   │   └── ProductCard.tsx
│   ├── data/products.ts                # Static product data (legacy)
│   └── lib/mongodb.ts                  # MongoDB connection singleton
├── package.json
├── tsconfig.json
├── next.config.ts
└── README.md
```

---

## 🗄️ Pre-Populated Data

The seed endpoint (`GET /api/seed`) populates the database with:

### Items (15 total — 3 per category)

| #  | Category | Name                            | Price     |
|----|----------|---------------------------------|-----------|
| 1  | Vinyls   | Abbey Road – The Beatles        | $34.99    |
| 2  | Vinyls   | Dark Side of the Moon – Pink Floyd | $29.99 |
| 3  | Vinyls   | Rumours – Fleetwood Mac         | $27.99    |
| 4  | Antique  | Victorian Oak Writing Desk      | $1,249.00 |
| 5  | Antique  | Art Deco Walnut Cabinet         | $899.00   |
| 6  | Antique  | Georgian Mahogany Bookcase      | $1,599.00 |
| 7  | GPS      | Garmin Forerunner 265           | $449.99   |
| 8  | GPS      | Polar Vantage V3                | $499.99   |
| 9  | GPS      | Suunto Race S                   | $399.99   |
| 10 | Shoes    | Nike Pegasus 41                 | $129.99   |
| 11 | Shoes    | Adidas Ultraboost Light         | $189.99   |
| 12 | Shoes    | New Balance Fresh Foam X        | $159.99   |
| 13 | Tent     | MSR Hubba Hubba 2-Person        | $479.99   |
| 14 | Tent     | REI Half Dome SL 3+             | $349.99   |
| 15 | Tent     | Big Agnes Copper Spur HV UL2    | $449.99   |

### Users (4 total)

| Username    | Role  | Password |
|-------------|-------|----------|
| testadmin   | admin | test     |
| alice       | user  | test     |
| bob         | user  | test     |
| charlie     | user  | test     |

### Ratings & Reviews

Each of the 3 regular users (**alice**, **bob**, **charlie**) has rated **and** reviewed **every item** (15 items × 3 users = **45 ratings + 45 reviews**). All reviews are unique and realistic.

---

## 🚀 Local Development

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
# Create .env.local with your MongoDB connection string:
#   MONGODB_URI=mongodb+srv://...

# 3. Run the development server
npm run dev

# 4. Seed the database (visit in browser or curl)
curl http://localhost:3000/api/seed

# 5. Open the application
open http://localhost:3000
```

---

## 📦 Deployment (Vercel)

1. Push the code to a GitHub repository.
2. Import the repository in [Vercel](https://vercel.com).
3. Add the `MONGODB_URI` environment variable in Vercel project settings.
4. Deploy — Vercel automatically detects Next.js and builds.
5. Visit `/api/seed` on the deployed URL to populate the database.

---

## 📝 Additional Notes

- **No external auth service** — Authentication is handled internally with bcrypt password hashing and localStorage-based session management for simplicity.
- **Emoji as product images** — To avoid external image hosting dependencies, products use emoji icons. A production version would use real product images hosted on a CDN.
- **RESTful API design** — All endpoints follow REST conventions with proper HTTP methods (GET, POST, PUT, DELETE) and meaningful status codes (200, 201, 400, 401, 404, 409).
- The application is fully responsive and works on desktop and mobile browsers.
