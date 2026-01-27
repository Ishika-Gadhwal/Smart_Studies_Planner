# 📘 Smart Study Planner – AI-Powered Personalized Study Planning

Smart Study Planner is a full-stack AI-powered web application that helps students generate **personalized daily study plans** based on their subjects, syllabus content, difficulty level, exam dates, and available study hours.

The application integrates **Google Gemini AI** to intelligently analyze user inputs and create realistic, effective, and time-optimized study schedules.

---

## 🚀 Features

- 🔐 **Secure Authentication**
  - JWT-based user registration and login
- 📚 **Subject & Syllabus Management**
  - Add subjects with exam dates
  - Paste syllabus content directly (no PDF upload required)
  - Assign difficulty levels to subjects
- 🧠 **AI-Generated Daily Study Plans**
  - Personalized plans generated using:
    - Daily available study hours
    - Subject difficulty
    - Syllabus content
    - User-defined comments & priorities
- 📝 **AI Guidance via Comments**
  - Users can add notes like weak topics or priorities to influence AI output
- 🌙 **Dark / Light Mode**
  - Enhanced usability and accessibility
- 📊 **Clean & Responsive UI**
  - Easy-to-read daily plans optimized for focus
- 💾 **Persistent Storage**
  - All user data stored securely in MongoDB

---

## 🛠️ Tech Stack

### Frontend
- React
- JavaScript (ES6+)
- CSS
- React Hooks & Context API

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication

### AI Integration
- Google Gemini API  
- SDK: `@google/generative-ai@0.5.0`

---

## 🏗️ Project Structure
```text
Smart-Study-Planner/
│
├── client/          # React.js frontend
│   ├── components/  # Reusable UI elements
│   ├── pages/       # Main application views
│   ├── context/     # State management
│   └── services/    # API calls
│
├── server/          # Node.js & Express backend
│   ├── controllers/ # Logic for routes
│   ├── routes/      # API endpoints
│   ├── models/      # MongoDB schemas
│   ├── middleware/  # Auth & error handling
│   └── config/      # Environment & DB config
│
└── README.md
```

## 🧑‍💻 Author

Ishika Gadhwal Aspiring Software Engineer | MERN Stack Developer
