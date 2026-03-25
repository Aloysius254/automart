# AutoMart - Cars & Spare Parts Store TODO

## Database Schema
- [x] Cars table (make, model, year, mileage, price, condition, description, status)
- [x] Spare parts table (name, category, sku, price, stock, compatibility, description)
- [x] Product images table (linked to cars or parts)
- [x] Cart table and cart items table
- [x] Orders table and order items table

## Backend API (tRPC Routers)
- [x] Cars router (list, detail, search, filter, admin CRUD)
- [x] Parts router (list, detail, search, filter by category/compatibility, admin CRUD)
- [x] Cart router (get, add item, update quantity, remove item, clear)
- [x] Orders router (create, list for user, detail, admin list all, update status)
- [x] Admin router (dashboard stats, inventory management)
- [x] Image upload support via S3

## Frontend - Foundation
- [x] Global CSS theme (elegant dark/light palette, typography)
- [x] Navigation bar with logo, links, cart icon, auth state
- [x] Footer component
- [x] Home/landing page with hero section, featured cars, featured parts, CTA

## Frontend - Customer Storefront
- [x] Car listings page with search, filters (make, model, year, price, condition)
- [x] Car detail page with image gallery, specs, add-to-inquiry
- [x] Spare parts catalog page with category filter, compatibility filter
- [x] Spare part detail page with images, specs, add-to-cart
- [x] Search results page

## Frontend - Cart & Checkout
- [x] Shopping cart page (items, quantities, totals)
- [x] Checkout page (customer info form, order summary)
- [x] Order confirmation page

## Frontend - Customer Account
- [x] Order history page
- [x] Order detail/tracking page

## Frontend - Admin Dashboard
- [x] Admin dashboard overview (stats: revenue, orders, inventory)
- [x] Car inventory management (list, add, edit, delete)
- [x] Spare parts inventory management (list, add, edit, delete)
- [x] Order management (list all orders, update status)
- [x] Admin-only route protection

## Testing & Polish
- [x] Seed demo data (cars, parts, images)
- [x] Write vitest tests for key procedures (20 tests passing)
- [x] Responsive design verification
- [x] Final UI polish and review
