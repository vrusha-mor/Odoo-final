🎤 Voice‑Based Menu Booking & POS System
Drive Link (Demo, Architecture & Videos):
👉 

A smart restaurant ordering system that allows users to place food orders using voice commands, powered by Speech‑to‑Text (Whisper), AI intent parsing, and a POS‑integrated backend.
Built as part of a hackathon journey, this project focuses on real‑world backend design, validation, and scalability rather than just UI.

🌐 Platform Overview
This project is implemented as a Web Application with a modular backend.

🌍 Web Application
Built using React (Vite)

Secure login & role‑based access

Voice‑driven order placement

POS & kitchen‑ready order flow

Responsive UI for desktop & tablets

The frontend and backend are loosely coupled, enabling future mobile app or kiosk extensions.

🏁 Hackathon Journey (Project Background)
✅ Selected in Round 1

💻 Cleared 2 Virtual Rounds, each lasting 8 hours

⚠️ Initially informed that we might not qualify for Round 3 based on backend evaluation

🎉 Later shortlisted for Round 3 (Finals)

🏫 Traveled to Ahmedabad – Adani University

⏱️ Participated in a 24‑hour on‑site hackathon

🧠 Faced deep technical & solvable questions from reviewers

❌ Did not finish as winners, but:

Completed the full project

Identified real backend & AI limitations

Gained production‑level system design experience

This project represents learning, resilience, and real engineering trade‑offs, not just a demo.

🚀 Core Features & KPIs
1. 🔐 Authentication & Security
JWT‑based authentication

Role stored securely in browser storage

Protected frontend routes

Password hashing using bcrypt

No password exposure in logs or responses

2. 🎤 Voice‑Based Food Ordering (Core Feature)
Speech‑to‑Text (STT)
Whisper (Local / Cloud) for accurate transcription

Supports formats:

WAV

WebM

MP3

Noise‑tolerant input handling

Intent Parsing
AI model extracts:

Food items

Quantities

Example:

“Two dosa and one coffee”

Outcome‑Based Booking
Orders are created only after menu validation

Prevents:

Empty orders

Zero‑amount orders

Invalid menu entries

3. 🍽️ Menu Validation & Resolver System
Spoken items are validated against the database

Case‑insensitive & partial match support

Only active menu items are allowed

Rejects orders if any item is invalid

Why this matters:
This prevents fake, partial, or hallucinated AI orders in a real POS environment.

4. 🧾 Order & Kitchen Workflow
Orders table:

total_amount

tax_amount

status

kitchen_status

Order items linked via product_id

Kitchen receives only validated orders

POS‑ready schema design

5. 📊 Database‑Driven Architecture
PostgreSQL used as the source of truth

Strict schema enforcement

No hard‑coded menu items

Fully extensible for:

Combos

Aliases

Multi‑language menus

🏗️ System Architecture
Backend Stack
Node.js

Express.js

PostgreSQL

JWT Authentication

Whisper (STT)

AI Intent Parsing (Gemini / LLM)

Multer for audio uploads

Frontend Stack
React.js (Vite)

React Router

Axios

Lucide Icons

Custom CSS / Modern UI styling

📁 Project Structure
project-root/
├── backend/
│   ├── src/
│   │   ├── controllers/        # Request handlers
│   │   ├── routes/             # API routes
│   │   ├── services/           # Business logic (STT, intent, booking)
│   │   ├── middlewares/        # Auth & role protection
│   │   ├── config/             # DB & env config
│   │   └── utils/              # Helpers
│   └── uploads/                # Temporary audio files
│
├── frontend/
│   ├── components/             # Navbar, Voice UI
│   ├── pages/                  # App pages
│   ├── services/               # API calls
│   └── styles/                 # CSS
│
└── database/
    └── schema.sql              # Tables & relations
🔗 Backend ↔ Frontend Code Connection
Voice Flow
Frontend records audio (MediaRecorder)

Audio sent to backend (/api/voice-booking)

Whisper transcribes audio

AI parses intent

Menu resolver validates items

Order is created

Response sent back to frontend

UI displays order summary

🔌 API Endpoints
Voice Booking
POST /api/voice-booking
Health Check
GET /health
🧪 Testing
Manual testing using UI

Backend logs for STT & intent

Database validation checks

Error‑first design (fail fast)

⚙️ Environment Variables
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/restaurant
JWT_SECRET=your_secret
GEMINI_API_KEY=your_api_key
🚀 Quick Start
Backend
cd backend
npm install
npm run dev
Frontend
cd frontend
npm install
npm run dev
🎯 Key Learnings
Voice systems must validate against DB

AI output ≠ truth

Backend design matters more than UI

Orders should never be partially created

Hackathons reward clarity, not complexity

👥 Contributors
Built as part of a Hackathon Team Project
Backend‑focused implementation with AI integration.

📝 License
This project was developed for educational & hackathon purposes.

📌 Final Note
This project is not about winning — it is about building something correct, scalable, and production‑ready.
