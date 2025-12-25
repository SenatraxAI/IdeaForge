<<<<<<< HEAD
# 🧠 Idea Validator (The "Neural Architect")

> **A brutally honest AI-powered co-founder that helps you stress-test, refine, and forge billion-dollar ideas.**

## 🚀 Overview

Idea Validator is not just a note-taking app. It is an **AI-Agentic Platform** that acts as a cynical Venture Capitalist ("The Adversary") and a brilliant Product Strategist ("Venty"). It pushes back on your assumptions, forces you to prove market viability, and generates investor-grade Product Requirement Documents (PRDs).

### ⚡ Key Features

-   **🔥 Idea Forge**: One-click generation of professional problem statements, solutions, and expanded technical specs from a single sentence.
-   **⚔️ Stress Test (The Adversary)**: A ruthless AI agent that rates your idea (0-100%) and tries to "kill" it by finding the single biggest point of failure.
-   **🛡️ Viability Roadmap**: An evolutionary step-by-step plan to fix the flaws identified by the Stress Test.
-   **🧠 Neural Pulse**: Real-time visual feedback of the AI's "thought process" during consultations.
-   **💬 AI Consult**: Context-aware chat that remembers your entire idea history and pivots.
-   **⚡ Smart Stability Core**: 
    -   **Exponential Backoff**: Automatically handles API rate limits (HTTP 429).
    -   **Smart Wait**: Parses "Retry-After" headers to respect server load (e.g., waiting 43s politely instead of crashing).
    -   **Cached Intelligence**: Performs live market research *once* and caches it for 7 days to save costs and quota.

## 🛠️ Tech Stack

-   **Frontend**: React (Vite), TailwindCSS, Framer Motion (Animations).
-   **Backend**: Node.js, Express, MongoDB (Atlas).
-   **AI Core**: Google Gemini 2.5 Flash / 2.0 Flash-Exp (Flexible Model Switching).
-   **Market Research**: Tavily Search API.

## 📦 Setup & Installation

1.  **Clone the repo**:
    ```bash
    git clone https://github.com/yourusername/idea-validator.git
    cd idea-validator
    ```

2.  **Backend Setup**:
    ```bash
    cd backend
    npm install
    # Create .env file with GEMINI_API_KEY, TAVILY_API_KEY, MONGODB_URI
    npm run dev
    ```

3.  **Frontend Setup**:
    ```bash
    cd frontend
    npm install
    npm run dev
    ```

## 🧠 The "Smart Retry" System

We implemented a custom resilience layer in `ai.service.ts` to handle the strict quotas of modern LLM APIs:
-   It intercepts **429 Too Many Requests**.
-   It reads the specific wait time requested by Google (e.g., "43.89 seconds").
-   It pauses execution exactly that long + 1s buffer.
-   It retries automatically, ensuring 100% reliability even on Free Tiers.

## 🔮 Future Roadmap

-   [ ] **Multi-Agent Debate**: Have "Marketing" and "Engineering" agents argue about your features.
-   [ ] **Pitch Deck Gen**: Auto-generate a slide deck from the Deep Dive PRD.
-   [ ] **Competitor Watch**: Daily alerts on competitor moves.
=======
<<<<<<< HEAD
# 🧠 Idea Validator - Frontend UI

The client-side interface for "The Neural Architect". Built with React, Vite, and Framer Motion.

## ⚡ Features
-   **Neural Pulse**: Visual feedback for AI processing states.
-   **Chat Interface**: Real-time consultation with "Venty" (The AI Strategist).
-   **Report View**: Beautiful rendering of the "Deep Dive" PRDs and Stress Test results.
-   **Spark Management**: Quick capture and management of idea sparks.

## 🛠️ Tech Stack
-   **Framework**: React (Vite)
-   **Styling**: TailwindCSS
-   **State/Auth**: Kinde Auth
-   **Animations**: Framer Motion

## 📦 Setup & Run
1.  Install dependencies:
    ```bash
    npm install
    ```
2.  Configure Environment:
    -   Ensure the backend is running on `http://localhost:5000`.
3.  Start Dev Server:
    ```bash
    npm run dev
    ```
=======
# IdeaForge_frontend
>>>>>>> 6091c571b36d9cbc2d9bebfe15239366538085fa
>>>>>>> e93d7aa203e4d74bf4d66afa8fc6031a5a659ff3
