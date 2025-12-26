# 🧠 IdeaForge: The Neural Architect

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933?logo=node.js)](https://nodejs.org/)
[![AI](https://img.shields.io/badge/AI-Google%20Gemini%202.0-orange?logo=google-gemini)](https://ai.google.dev/)

**IdeaForge** is a sophisticated, agentic AI platform designed to stress-test, refine, and forge startup ideas. It's not just a validator—it's a digital co-founder that uses multi-agent reasoning to identify fatal flaws and generate investor-grade strategy.

## ✨ High-Impact Features

### ⚔️ The Adversary (Stress Test)
A specialized AI agent that adopts a cynical VC persona. It rigorously analyzes your idea, calculates a viability score (0-100%), and identifies the **Critical Point of Failure** that could kill your business.

### 🛡️ Viability Roadmap (The Evolution Atlas)
Automatically generates a 10-phase execution plan specifically designed to mitigate the risks identified by "The Adversary."

### 🧠 Neural Studio & Consult
A context-aware AI workspace where you can pivot and refine your idea in real-time. Features a "Neural Pulse" indicator that visualizes the AI's step-by-step reasoning process.

### 📄 Professional PDF Reports
One-click export of comprehensive Product Requirement Documents (PRDs) and market strategy reports, formatted with professional high-contrast styling.

## 🛠️ Performance & Resilience Engineering

*   **Intelligent Retry Layer**: Custom exponential backoff that parses "Retry-After" headers from the Gemini API to handle rate limits gracefully (429 handling).
*   **Cached intelligence**: Integrated search caching to reduce API costs and latency.
*   **Safety Rendering**: Hardened React components that gracefully handle non-deterministic AI outputs.

## 🚀 Quick Start (Plug & Play)

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [MongoDB](https://www.mongodb.com/products/platform/atlas-database) (Atlas or local)

### 2. Installation
```bash
# Clone and install all dependencies (Monorepo)
git clone https://github.com/SenatraxAI/IdeaForge.git
cd IdeaForge
npm run install-all
```

### 3. Environment Configuration
Create a `.env` in `backend/` and `frontend/`:

**Backend (`backend/.env`):**
```env
PORT=5000
MONGODB_URI=your_mongodb_uri
GEMINI_API_KEY=your_google_ai_key
TAVILY_API_KEY=your_search_api_key
KINDE_SITE_URL=http://localhost:5173
```

**Frontend (`frontend/.env`):**
```env
VITE_API_URL=http://localhost:5000/api
VITE_KINDE_DOMAIN=your_domain.kinde.com
VITE_KINDE_CLIENT_ID=your_client_id
```

### 4. Run Development
```bash
# Starts both Backend and Frontend concurrently from the root
npm run dev
```

## 🧩 Tech Stack
-   **Frontend**: React (Vite), TailwindCSS, Framer Motion, Lucide Icons.
-   **Backend**: Node.js, Express, MongoDB (Atlas).
-   **AI Core**: Google Gemini 2.0 Flash (Agentic Architecture).

---
*Created with ❤️ for the Open Source Community by [SenatraxAI](https://github.com/SenatraxAI).*
