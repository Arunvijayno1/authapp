# MERN Authentication App 🚀

A full-stack **MERN (MongoDB, Express, React, Node.js)** authentication system with JWT, CORS, and mobile-ready API access.  
Supports both **local**, **LAN (mobile access)**, and **Docker** environments — all storing data in **MongoDB Compass**.

---

## 🧩 Features

✅ User Registration (Signup)  
✅ User Login with JWT Authentication  
✅ Role-Based Access (User / Admin)  
✅ Works across devices (Laptop, Mobile, Docker)  
✅ MongoDB Compass Integration  
✅ APK support via Capacitor  
✅ Secure `.env` configuration  

---
<pre>
project/
│
├── backend/                      # Express + MongoDB API
│   ├── models/                   # Mongoose models
│   │   └── User.js
│   │
│   ├── server.js                 # Main backend server file
│   ├── config.js                 # MongoDB + environment config
│   ├── package.json
│   ├── package-lock.json
│   ├── .env                      # Environment variables
│   └── node_modules/
│
├── frontend/                     # React (Vite) frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   └── Signup.jsx
│   │   ├── components/           # Optional shared components
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── public/
│   ├── vite.config.js
│   ├── package.json
│   ├── package-lock.json
│   └── node_modules/
│
├── docker-compose.yml            # Docker configuration
├── .gitignore                    # Ignored files & folders
└── README.md                     # Documentation
</pre>  
---

## 🛠️ Setup Instructions

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/<your-username>/<your-repo>.git
cd project

2️⃣ Backend Setup
cd backend
npm install

📄 .env example:
MONGO_URI_LOCAL=mongodb://localhost:27017/mern-auth
MONGO_URI_DOCKER=mongodb://host.docker.internal:27017/mern-auth
DOCKER_ENV=false
JWT_SECRET=your_super_secret_key_123
PORT=5000

▶️ Run backend locally:
node server.js
Server will start at
👉 http://localhost:5000 (PC)
👉 http://<your-LAN-IP>:5000 (Phone / same Wi-Fi)

3️⃣ Frontend Setup
cd frontend
npm install
npm run dev
Visit your app in the browser:
👉 http://localhost:5173

4️⃣ Run with Docker (optional)
Make sure Docker Desktop is running.
docker-compose up --build
Both backend and MongoDB will start automatically.

5️⃣ Accessing MongoDB Compass
Open MongoDB Compass
Connect using:
mongodb://localhost:27017/mern-auth
You’ll see your database and user collections (created on signup).

📱 Build as Android APK
Go to your frontend directory
Run:
npm run build
npx cap copy
cd android
./gradlew assembleDebug
The APK will be created at:
frontend/android/app/build/outputs/apk/debug/app-debug.apk
Install the APK on your Android device.

🧪 API Routes
Method	Endpoint	Description
POST	/api/auth/signup	Register a new user
POST	/api/auth/login	Login and receive JWT
GET	/api/test/all	Public route
GET	/api/test/user	Protected (User role)
GET	/api/test/admin	Protected (Admin role)

🔐 Tech Stack

Frontend: React + Vite

Backend: Express.js + Node.js

Database: MongoDB (Compass / Docker)

Authentication: JWT + bcrypt

Deployment: Docker & Capacitor

🧑‍💻 Developer
Arun Vijay
🚀 Passionate Full Stack Developer
📧 arunvijay4116@gmail.com

📜 License
This project is open-source under the MIT License.

---

Would you like me to:
✅ Automatically create this `README.md` file and the `.gitignore` file inside your project (so you can just push it to GitHub)?
