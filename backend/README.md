<<<<<<< HEAD
# 🧠 Idea Validator - Backend API

The Neural Core of the Idea Validator platform. Powered by Node.js, Express, and Google Gemini 2.5.

## 🛠️ Tech Stack
-   **Runtime**: Node.js (TypeScript)
-   **Framework**: Express.js
-   **Database**: MongoDB Atlas
-   **AI Engine**: Google Gemini 2.5 Flash (via `@google/generative-ai`)
-   **Search**: Tavily Search API

## 🚀 Key Services
-   **`ai.service.ts`**: Handles "Smart Retry" logic for Google API rate limits.
-   **`search.service.ts`**: Performs consolidated market research.
-   **`idea.controller.ts`**: Manages the "Forge", "Stress Test", and "Consult" workflows.

## 📦 Setup & Run
1.  Install dependencies:
    ```bash
    npm install
    ```
2.  Configure `.env`:
    ```env
    GEMINI_API_KEY=your_key
    TAVILY_API_KEY=your_key
    MONGODB_URI=your_mongo_url
    ```
3.  Start server:
    ```bash
    npm run dev
    ```
=======
# IdeaForge_backend
>>>>>>> d6b5a5d413415f6e5ed5fab83d3f6f3697d4ab89
