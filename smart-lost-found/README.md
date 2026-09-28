# Smart Lost & Found Portal

A beginner-friendly MERN stack project for a college campus. Students can register/login, report lost or found belongings, upload images, search/filter records, edit/delete their own reports, contact the reporter, mark items recovered/claimed, and see possible matches. Admins can verify reports and manage users/reports.

## Stack
- React + Vite + React Router
- Node.js + Express
- MongoDB Atlas + Mongoose
- JWT authentication + bcrypt password hashing
- Multer for image uploads (local development)
- Optional Cloudinary configuration for production

## Folder structure
```text
smart-lost-found-portal/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env.example
│   └── package.json
├── backend/
│   ├── config/db.js
│   ├── middleware/auth.js
│   ├── middleware/upload.js
│   ├── models/User.js
│   ├── models/Item.js
│   ├── routes/authRoutes.js
│   ├── routes/itemRoutes.js
│   ├── routes/adminRoutes.js
│   ├── seedAdmin.js
│   ├── server.js
│   ├── .env.example
│   └── package.json
└── README.md
```

## 1. Requirements
Install Node.js 20+ and create a MongoDB Atlas database. In Atlas, create a database user and allow your development IP under Network Access.

## 2. Backend
Open a terminal in `backend`:

```bash
npm install
```

Copy `.env.example` to `.env` and add your Atlas connection string.

```bash
npm run seed:admin
npm run dev
```

Backend runs at `http://localhost:5000`.

Demo admin after seeding:
- Email: `admin@campus.local`
- Password: `Admin@12345`

Change these credentials before real deployment.

## 3. Frontend
Open another terminal in `frontend`:

```bash
npm install
npm run dev
```

Frontend runs at the Vite URL shown in the terminal, normally `http://localhost:5173`.

## 4. Environment files
Backend `.env`:
```env
PORT=5000
MONGO_URI=mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/smart_lost_found
JWT_SECRET=replace_with_a_long_random_secret
CLIENT_URL=http://localhost:5173
ADMIN_EMAIL=admin@campus.local
ADMIN_PASSWORD=Admin@12345
```

Frontend `.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

## 5. Main workflow to demonstrate
1. Register as a student.
2. Log in.
3. Create a Lost report with an image.
4. Create a Found report.
5. Open Browse and search/filter records.
6. Open an item and see possible matches.
7. Edit and delete your own report.
8. Use Contact Reporter on an approved report.
9. Mark your item recovered/claimed.
10. Log in as admin and approve/reject pending reports.

## 6. Smart matching
The backend compares a lost item with found items (and vice versa) using:
- category match: 35 points
- location match: 25 points
- date proximity: 20 points
- keyword overlap: 20 points

The UI shows the resulting percentage and the reasons, making the algorithm easy to explain in a viva. It is a rule-based similarity system, not a claim of machine-learning accuracy.

## 7. Cloudinary
The included development implementation uses Multer and stores uploads in `backend/uploads`. For deployment, connect Cloudinary by replacing the storage configuration in `backend/middleware/upload.js` with Cloudinary's Multer storage adapter and adding your Cloudinary credentials. The rest of the API already accepts multipart image uploads.

## 8. 100-mark project roadmap
### Module 1 — Authentication
JWT login/register, hashed passwords, student/admin roles.
### Module 2 — Item CRUD
Create, read, update, delete Lost/Found records.
### Module 3 — Search & filtering
Search title/description, filter type/category/status/location.
### Module 4 — Images
Multer upload, preview, image display.
### Module 5 — Admin verification
Pending → approved/rejected; admin statistics and user list.
### Module 6 — Claim/contact
Contact reporter and recovered/claimed workflow.
### Module 7 — Smart matching
Rule-based similarity score and explanations.
### Module 8 — Testing/deployment
Validation, authorization, error handling, production environment variables, MongoDB Atlas, frontend hosting and backend hosting.

## Suggested viva points
- Why MongoDB? Flexible item documents and easy Mongoose modeling.
- Why JWT? Stateless authentication for a REST API.
- Why bcrypt? Passwords should never be stored as plain text.
- Why middleware? Reuse authentication/role checks across routes.
- Why Multer? Handles `multipart/form-data` uploads in Express.
- How is CRUD demonstrated? POST/GET/PUT/DELETE on `/api/items`.
- How is authorization demonstrated? Only owners can edit/delete their reports; only admins can approve/reject and manage users.
- How does matching work? Weighted rule-based comparison across category, location, date and keywords.
