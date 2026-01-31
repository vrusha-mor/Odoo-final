# 🎤 Voice-Based Menu Booking & POS System

**Drive Link (Demo, Architecture & Videos):**  
👉 (https://drive.google.com/drive/folders/1M0EwIbWc0KmLEEWap3etWrfUkd7gBMgP?usp=drive_link)

A smart restaurant ordering system that allows users to place food orders using voice commands, powered by Speech‑to‑Text (Whisper), AI intent parsing, and a POS‑integrated backend.

This project was built as part of a hackathon journey, focusing heavily on backend correctness, AI validation, and real‑world system design.

---

## 🌐 Platform Overview

### 🌍 Web Application
- Built using **React (Vite)**
- Secure login & role-based access
- Voice-driven food ordering
- POS & kitchen-ready order workflow
- Responsive UI for desktop & tablets

Frontend and backend are loosely coupled, allowing future mobile or kiosk extensions.

---

## 🏁 Hackathon Journey

- ✅ Selected in **Round 1**
- 💻 Cleared **2 Virtual Rounds** (8 hours each)
- ⚠️ Initially informed backend performance may not qualify for Round 3
- 🎉 Later shortlisted for **Final Round**
- 🏫 Final round conducted at **Adani University, Ahmedabad**
- ⏱️ **24-hour on-site hackathon**
- 🧠 Faced deep, well-structured technical questions from reviewers
- ❌ Did not win, but successfully completed the project

> This project represents learning, resilience, and real engineering trade-offs rather than just a demo.

---

## 🚀 Core Features

### 1. 🔐 Authentication & Security
- JWT-based authentication
- Protected frontend routes
- Role-based access control
- Password hashing using **bcrypt**
- No password exposure in logs or responses

---

### 2. 🎤 Voice-Based Food Ordering

#### Speech-to-Text (STT)
- Whisper (Local / Cloud)
- Supported formats: WAV, WebM, MP3
- Noise-tolerant voice input

#### Intent Parsing
- AI extracts:
  - Food items
  - Quantities

Example:
> “Two dosa and one coffee”

---

### 3. 🍽️ Menu Validation System
- Spoken items validated against database
- Case-insensitive & partial matching
- Only active menu items allowed
- Prevents hallucinated or invalid AI orders

---

### 4. 🧾 Order & Kitchen Workflow
- Orders table with:
  - total_amount
  - status
  - kitchen_status
- Order items linked using product_id
- Kitchen receives only validated orders

---

### 5. 📊 Database-Driven Design
- PostgreSQL as single source of truth
- Strict schema enforcement
- No hardcoded menu data
- Easily extensible for combos & aliases

---

## 🏗️ System Architecture

### Backend Stack
- Node.js
- Express.js
- PostgreSQL
- JWT Authentication
- Whisper (STT)
- AI Intent Parsing
- Multer (audio upload)

### Frontend Stack
- React.js (Vite)
- React Router
- Axios
- Lucide Icons
- Custom CSS styling

---

## 📁 Project Structure

```bash
project-root/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── middlewares/
│   │   ├── config/
│   │   └── utils/
│   └── uploads/
│
├── frontend/
│   ├── components/
│   ├── pages/
│   ├── services/
│   └── styles/
│
└── database/
    └── schema.sql

🔗 Backend ↔ Frontend Flow
User records voice

Audio sent to backend

Whisper transcribes audio

AI extracts intent

Menu resolver validates items

Order is created in DB

Response returned to frontend

UI shows order summary

🔌 API Endpoints
Voice Booking
POST /api/voice-booking

Health Check
GET /health

⚙️ Environment Variables
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/restaurant
JWT_SECRET=your_secret_key
GEMINI_API_KEY=your_api_key

🚀 Quick Start
Backend Setup
cd backend
npm install
npm run dev

Frontend Setup
cd frontend
npm install
npm run dev

🎯 Key Learnings
AI output must always be validated

Voice systems require strong backend checks

Database-driven logic prevents failures

Hackathons reward clarity over complexity

👥 Contributors
Built as part of a Hackathon Team Project
Focus areas:

Backend architecture

AI & voice integration

Database design

📝 License
This project was developed for educational and hackathon purposes only.

📌 Final Note
This project is not about winning — it is about building something correct, scalable, and production‑ready.
