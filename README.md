# EcommercePlatformForSmallBusinesses_Retail

## Introduction

My project is called LocalKart, an e-commerce platform made for small businesses. The main purpose of this project is to help local sellers take their business online and reach more customers. Many small vendors don’t have the resources or technical knowledge to create a website or app, so this platform makes it easy for them to list and manage their products without any hassle.

On the platform, sellers can log in to their own dashboard where they can add new products, edit existing ones, and even sort or search through their listings. For customers, there’s a user-friendly dashboard where they can browse all available products, search by category or name, add items to a wishlist, and shop by adding products to their cart. Once ready, they can place an order directly from the site.

This project aims to solve the real-world problem of helping small businesses go digital, manage their products easily, and connect with customers who prefer online shopping.

## Project Type

Fullstack

## Deplolyed App

Frontend: https://deployed-site.whatever
Backend: https://deployed-site.whatever
Database: https://deployed-site.whatever

## Directory Structure

my-app/
├─ assets/
    ├─ icons/
        ├─ localkart.logo
    ├─ images/
        ├─ categories-imgs/
        ├─ main-banner-imgs/
├─ auth/
    ├─ seller/
        ├─ seller-login.css
        ├─ seller-login.html
        ├─ seller-login.js
        ├─ seller-signup.css
        ├─ seller-signup.html
        ├─ seller-signup.js
    ├─ user/
        ├─ user-login.css
        ├─ user-login.html
        ├─ user-login.js
        ├─ user-signup.css
        ├─ user-signup.html
        ├─ user-signup.js
├─ firebase/
    ├─ firebase-config.js
├─ pages/
    ├─ seller/
        ├─ seller-dashboard.css
        ├─ seller-dashboard.html
        ├─ seller-dashboard.js
    ├─ user/
        ├─ cart.css
        ├─ cart.html
        ├─ cart.js
        ├─ products.css
        ├─ products.html
        ├─ products.js
├─ index.html
├─ main.js
├─ README.md
├─ styles.css


## Video Walkthrough of the project

https://youtu.be/CTl2GMBC4iI?si=a5cuubiN4QwOwUDA

## Video Walkthrough of the codebase

https://youtu.be/Itn-bixeJVU

## Features

- Separate Login for Sellers and Users
Sellers and users have their own login systems to access relevant dashboards.

- Product Management for Sellers
Sellers can add, edit, delete, and sort their products easily from a clean dashboard.

- Product Listings for Users
All available products are shown on the user dashboard with filters for category and search.

- Search and Filter
Users can quickly search for products or filter them based on categories.

- Wishlist
Users can add products they like to a wishlist and revisit them later.

- Shopping Cart
Users can add products to their cart, update quantities, and remove items.

- Place Orders
Once items are in the cart, users can proceed to place an order.

- Price Summary Sidebar
While viewing the cart, users can see a sidebar with price breakdown, including delivery fees (free if cart is empty).

- Product Detail View
Users can click on products to view detailed information before buying.

- Firebase Integration
The app uses Firebase for authentication, database (Firestore), and data updates in real time.

## design decisions or assumptions

- Separation of Seller and User Roles
I decided to create separate dashboards for sellers and users to avoid confusion and make each experience more focused.

- Firebase as the Backend
Firebase was chosen for ease of authentication, real-time updates, and simple setup since this is a solo project.

- Responsive and Minimal UI
The design uses a clean layout with essential elements only, so users can browse products without distractions. I also made sure it works well on smaller screens.

- Cart and Wishlist Stored in Firestore
All user interactions like cart and wishlist are synced with Firestore so they can be accessed across devices after login.

- No Payment Gateway Yet
As per the project scope and timeline, I skipped payment integration and assumed users place orders without paying online for now.

- Fixed ₹50 Delivery Fee
A ₹50 delivery fee is added during checkout to simulate a realistic price breakdown, but it becomes ₹0 if the cart is empty.

- Product Filters by Category and Search
I assumed that most users would want to search products by category and keyword, so advanced filters (like brand, price range) are planned for later.

- Wishlist is Optional, Not Mandatory
I included a wishlist feature to improve user convenience, assuming users often like to bookmark items before buying.

- Simple Product Schema
Each product includes basic fields like name, price, image, category, description, and stock — assuming this is enough for a minimum viable product.

- Single Admin = Seller
Each seller manages their own products. I assumed there’s no global admin overseeing all sellers in this version.


## Credentials

1. Sellers
-  username : rahul@gmail.com
   password : 123456

-  username : vishal@gmail.com
   password : 123456

2. Users
-  username : a@gmail.com
   password : 123456

-  hitesh@gmail.com
   password : 123456

## APIs Used

1. Firebase (Google Firebase Platform)
LocalKart uses Firebase for multiple backend services. Below are the specific Firebase APIs and what they handle:

Authentication API
Used to handle secure login and signup for both sellers and users.

Cloud Firestore
Used as the main database to store user data, seller data, product listings, carts, wishlists, and orders.

Firebase Hosting (optional)
If the app is deployed on Firebase, it uses Firebase Hosting to serve the frontend.


## Technology Stack

1. HTML5
Used for structuring the content of web pages. It helps define the layout and elements like buttons, forms, and containers.

2. CSS3
Used for styling the application. It controls how the app looks — including colors, layout, fonts, spacing, and responsiveness.

3. JavaScript (Vanilla JS)
Handles interactivity and logic in the application. Used for features like search, cart updates, modals, and form handling.

4. Firebase (Google Platform)
Firebase is used for backend services:

Authentication – Manages user and seller login/signup.

Firestore (Database) – Stores product info, user carts, orders, wishlists, etc.

Firebase Hosting (optional) – Used to host the frontend application.

5. Bootstrap 5
A CSS framework used to make the design responsive and clean. It helps with grid layout, modals, buttons, and other UI components.

6. Google Fonts (Montserrat)
Used to apply a custom font to the app for a modern and clean visual appearance.
