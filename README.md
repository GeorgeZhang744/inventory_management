# Inventory Management App

## Table of Contents

- [Introduction](#introduction)
- [Deployed Website](#deployed-website)
- [Features](#features)
- [Setup and Installation](#setup-and-installation)
- [Environment Variables](#environment-variables)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)

## Introduction

The Inventory Management App is a web application designed to help users manage their inventory effectively. Users can add, remove, and update inventory items, scan items via image upload, and integrate with Firebase for authentication and storage. The app also utilizes OpenAI for advanced image processing to automatically recognize and count items in uploaded images.

## Deployed Website

You can access the live version of the Inventory Management App at the following link:

[Inventory Management App - Live](https://inventory-management-kappa-wheat.vercel.app/)

## Features

- User authentication using Firebase
- Allow user to keep track of the inventory items under their user account
- Add, remove, and update inventory items
- Image scanning for automatic inventory recognition using OpenAI
- Export inventory to CSV file

## Setup and Installation

### Prerequisites

Before you begin, ensure you have met the following requirements:

- Node.js installed on your machine (v14.x or later)
- A Firebase account and project setup
- OpenAI API key

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/GeorgeZhang744/inventory_management.git
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:

   Create a `.env` file in the root directory and add the following variables:

   ```env
   OPENAI_API_KEY=your_openai_api_key
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

   The app should now be running on `http://localhost:3000`.

### Firebase Setup

1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Create a new project (or use an existing one).
3. Add a web app to your Firebase project.
4. Copy the Firebase configuration and add it to your `.env` file as shown above.
5. Enable Firebase Authentication with Email/Password.
6. Set up Firestore and Storage in your Firebase project.

## Environment Variables

The app uses environment variables to manage API keys and configuration settings. Ensure you have the following in your `.env` file:

```env
OPENAI_API_KEY=your_openai_api_key
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id
```

## Usage

1. **Sign Up/Login:** Create a new account or log in with your existing credentials.
2. **Add Inventory Items:** Use the form to add new items to your inventory.
3. **Update/Delete Items:** Adjust quantities or remove items as needed.
4. **Search Items** Search items base on their names.
5. **Scan Items:** Upload an image of items to automatically recognize and count them.
6. **View Inventory:** Browse through your inventory with pagination support.
7. **Export Inventory:** Export your inventory to a CSV file.

## API Endpoints

The app includes custom API routes for handling different tasks:

- **POST `/api/scanImage`**: Handles image uploads and processes the image using OpenAI to identify inventory items.
- **POST `/api/exportInventory`**: Exports inventory data provided in the request body to a CSV file.
