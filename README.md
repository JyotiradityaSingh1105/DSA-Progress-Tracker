# DSA Progress Tracker

A full-stack DSA learning tracker built with:

- HTML
- CSS
- JavaScript
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT authentication
- bcrypt password hashing

## Features

- Register and login
- JWT authentication
- MongoDB-backed progress
- Mark DSA topics complete/incomplete
- Automatic progress percentage
- Reset progress
- Responsive UI

## Run locally

### 1. Install Node.js

Install Node.js LTS from the official Node.js website.

### 2. Install dependencies

```bash
npm install
```

### 3. Configure MongoDB

Create a MongoDB Atlas database and copy your connection string.

Copy `.env.example` to `.env` and set:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret
```

### 4. Start

Development:

```bash
npm run dev
```

Normal:

```bash
npm start
```

Open:

http://localhost:5000

## API

POST /api/auth/register
POST /api/auth/login
GET /api/progress
PUT /api/progress/:topicId
DELETE /api/progress

## Suggested future features

- Individual LeetCode/GFG problems
- Difficulty levels
- Problem links
- Search and filters
- Streak counter
- Charts
- Admin panel
- Deployment on Render/Railway
