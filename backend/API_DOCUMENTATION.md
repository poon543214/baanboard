# Baanboard Backend API Documentation

## Overview
This document provides endpoint descriptions, request/response formats, and database schemas.

---

## Authentication Endpoints

### Register
- **URL:** `/register`
- **Method:** `POST`
- **Headers:** `Content-Type: multipart/form-data`
- **Body:**
  - `fullname` (string, required)
  - `email` (string, required)
  - `tel` (string, required)
  - `password` (string, required)
  - `profileImage` (file, optional)
- **Notes:**
  - The **first user ever registered** will automatically be assigned the `admin` role.
  - All subsequent registrations are created as `user` by default.
- **Response:**
  ```json
  { "message": "Registered successfully" }
  ```

### Login
- **URL:** `/login`
- **Method:** `POST`
- **Headers:** none
- **Body:**
  - `email` (string, required)
  - `password` (string, required)
- **Response:**
  ```json
  {
    "token": "<jwt_token>",
    "role": "user|admin",
    "fullname": "...",
    "profileImage": "url_or_null"
  }
  ```

### Update Profile
- **URL:** `/profile`
- **Method:** `PUT`
- **Headers:** `Authorization: Bearer <token>`, `Content-Type: multipart/form-data`
- **Body (any of):**
  - `fullname` (string)
  - `tel` (string)
  - `password` (string, new password)
  - `profileImage` (file)
- **Response:** Updated user object

---

## Admin Endpoint

### Create Admin
- **URL:** `/createadmin`
- **Method:** `POST`
- **Headers:** `Authorization: Bearer <token>` (must be an admin), `Content-Type: multipart/form-data`
- **Body:** same as register (`fullname`, `email`, `tel`, `password`, optional `profileImage`)
- **Description:** Allows an existing admin to create a new admin account.
- **Response:** `{ "message": "Admin created" }`

---

## Post Endpoints

### Get Posts
- **URL:** `/getpost`
- **Method:** `GET`
- **Headers:** `Authorization: Bearer <token>`
- **Query Parameters (optional):**
  - `search` (string) - search by title
  - `order_by` (string) - `post_date` for descending
- **Response:** Array of post objects with populated owner and comments, including `likeCount`.

### Get Liked Posts
- **URL:** `/liked`
- **Method:** `GET`
- **Headers:** `Authorization: Bearer <token>`
- **Response:** Array of posts the user has liked (same format as above).

### Create Post
- **URL:** `/post`
- **Method:** `POST`
- **Headers:** `Authorization: Bearer <token>`, `Content-Type: multipart/form-data`
- **Body:**
  - `title` (string)
  - `content` (string)
  - `image` (file, optional)
- **Response:** Created post object.

### Edit Post
- **URL:** `/post/:id`
- **Method:** `PUT`
- **Headers:** `Authorization: Bearer <token>`, `Content-Type: multipart/form-data`
- **Body (any of):**
  - `title` (string)
  - `content` (string)
  - `image` (file, optional)
- **Permissions:** Only the post owner or an admin may modify.
- **Response:** Updated post object.

### Like/Unlike Post
- **URL:** `/post/:id/like`
- **Method:** `POST`
- **Headers:** `Authorization: Bearer <token>`
- **Response:** `{ "likeCount": number }

### Comment on Post
- **URL:** `/post/:id/comment`
- **Method:** `POST`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  - `text` (string)
- **Response:** The updated post object.

### Delete Post
- **URL:** `/deletepost/:id`
- **Method:** `DELETE`
- **Headers:** `Authorization: Bearer <token>`
- **Response:** `{ "message": "Deleted" }`

---

## Database Schemas (Mongoose)

### User Schema
```js
const userSchema = new mongoose.Schema({
  fullname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  tel: { type: String, required: true },
  password: { type: String, required: true },
  profileImage: { type: String, default: null },
  role: { type: String, enum: ['user', 'admin'], default: 'user' }
});
```

### Comment Subschema
```js
const commentSchema = new mongoose.Schema({
  text: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  created_at: { type: Date, default: Date.now }
});
```

### Post Schema
```js
const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  image: { type: String },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [commentSchema],
  created_at: { type: Date, default: Date.now }
});
```

---

## Notes
- Include `Authorization: Bearer <token>` for all protected routes.
- Use multipart requests when uploading files.

This documentation can be distributed to the frontend team directly. Adjust as necessary for future changes.
