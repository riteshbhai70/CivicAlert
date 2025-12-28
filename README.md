# 🚨 CivicAlert – Real-Time Incident Reporting Platform

CivicAlert is a **modern, responsive, single-page web application** that enables citizens to report real-time incidents and helps authorities or responders manage, verify, and prioritize them efficiently.

It is designed with a **professional SaaS-style UI**, making it ideal for **hackathons, smart-city solutions, and real-world civic tech use cases**.

---

## 🌐 Live Demo

🚀 **Hosted on Render**  
🔗 Live URL: https://<your-render-app-name>.onrender.com  
*(Add your Render URL after deployment)*

---

## 🖼️ Screenshots

> Create a folder named `/screenshots` in the root of the project and add images.

### 🏠 Incident Reporting (Home)
![Home Page](screenshots/home.png)

### 📡 Live Incident Feed
![Live Feed](screenshots/feed.png)

### 🔐 Admin Dashboard
![Admin Dashboard](screenshots/admin.png)

---

## ✨ Features

### 👤 Public Citizen Features
- Report incidents in real time
- Supported incident types:
  - Accident
  - Medical
  - Fire
  - Infrastructure
  - Safety
- Two location input options:
  - ✍️ Manual address / latitude & longitude
  - 📍 Auto-detect current location
- Live **map preview** using OpenStreetMap
- Optional media (image) upload (UI only)
- Auto-generated **Case / Incident ID**
- Mobile-first & fully responsive UI

---

### 📡 Live Incident Feed
- Auto-refreshing incident feed (frontend simulation)
- Card and table views
- Filters:
  - Incident type
  - Time range (UI placeholder)
- Severity badges:
  - Low / Medium / High
- Priority-based sorting

---

### 🔐 Admin / Responder Panel
- Mock authentication (frontend-only)
- Role-based access (Admin)
- Dedicated admin dashboard layout
- Incident lifecycle management:
  - Unverified → Verified → In Progress → Resolved
- Mark false / duplicate reports
- Internal notes per incident

---

### 📊 Analytics & Reports
- Summary widgets:
  - Total incidents
  - Active incidents
  - High severity alerts
  - Resolved incidents
- Charts:
  - Incidents by type
  - Severity distribution
  - Incident trends
- Export data:
  - 📄 PDF (jsPDF)
  - 📊 Excel (.xlsx via SheetJS)

---

### 🎨 UI / UX
- Clean, professional SaaS design
- Sidebar + Topbar navigation
- Light / Dark mode with persistence
- Smooth animations & transitions
- Accessible, scalable, enterprise-grade layout

---

## 🛠️ Tech Stack (Frontend)

- **React** + **TypeScript**
- **Vite**
- **Tailwind CSS**
- **shadcn/ui**
- **Lucide Icons**
- **React Router**
- **Axios** (Mock APIs)
- **Leaflet + OpenStreetMap** (Maps)

---

## 🧱 Project Structure

src/
├── components/
│ ├── layout/
│ ├── ui/
│ └── shared/
├── pages/
│ ├── ReportPage.tsx
│ ├── FeedPage.tsx
│ ├── LoginPage.tsx
│ ├── AdminDashboard.tsx
│ ├── AdminIncidentsPage.tsx
│ └── AdminReportsPage.tsx
├── contexts/
├── services/
│ └── api.ts (mock backend)
├── types/
├── hooks/
├── App.tsx
├── main.tsx
└── index.css

yaml
Copy code

---

## ⚙️ Local Development Setup

### Prerequisites
- Node.js **v18+**
- npm

### Steps

```bash
# 1️⃣ Clone the repository
git clone https://github.com/riteshbhai70/civicalert.git

# 2️⃣ Go to project directory
cd civicalert

# 3️⃣ Install dependencies
npm install

# 4️⃣ Start development server
npm run dev
App will run at:

arduino
Copy code
http://localhost:5173
🔐 Demo Admin Credentials
pgsql
Copy code
Username: admin
Password: admin@123
(Mock authentication for demo only)

🚀 Deployment on Render (Static Site)
Steps to Deploy
Push your code to GitHub
👉 https://github.com/riteshbhai70/civicalert

Go to https://render.com

Click New → Static Site

Connect your GitHub repository

Configure settings:

Build Command

bash
Copy code
npm install && npm run build
Publish Directory

bash
Copy code
dist
(Optional but recommended)
Add this Rewrite Rule for SPA routing:

makefile
Copy code
Source: /*
Destination: /index.html
Click Deploy

🎉 Your CivicAlert app will be live!

🔌 Backend Integration Plan
CivicAlert is currently frontend-only, but fully prepared for backend integration using:

Flask

MongoDB Atlas

REST APIs

All mock API logic lives in:

bash
Copy code
src/services/api.ts
This can be directly replaced with Flask endpoints later.

🏆 Ideal Use Cases
Hackathons

Smart City Applications

Emergency Response Platforms

Civic Technology Projects

Academic / Final-Year Projects

👨‍💻 Author
Ritesh Kumar
GitHub: https://github.com/riteshbhai70

📄 License
This project is intended for educational, hackathon, and demonstration purposes.