# Product Guide: IdeaForge

## Initial Concept
IdeaForge is a dual-purpose platform: a sophisticated AI engine that expands and stress-tests ideas (the "Forge"), and a "LinkedIn-style" social environment where users "build in public" (the "Social Lab").

## User Experience & Design
The platform will feature a clean, intuitive, and modern UI/UX, built with Tailwind CSS and Shadcn/UI.

*   **Theme:** A dark and light mode will be available by default.
*   **Focus Mode Logic:** A client-side activity tracker will listen for user activity. If no input is detected for a user-configured time, it will trigger a browser notification and dim the screen.
*   **Score Display:** The "Stress-Tester" score will be visualized using a Slider component.
*   **Cross-Platform:** The experience will be seamless between a web app and a dedicated mobile app.

## Core Platform Features
*   **Idea Notebook:** A private space for users to save and incubate raw ideas.
*   **The Forge:** An AI engine to develop a rough idea into a detailed specification (Problem, Solution, Target Audience, Revenue Model). This process is iterative, allowing for continuous idea tweaking.
*   **The Stress-Tester:** An AI agent that identifies flaws.
    *   **Output Format:** Output must be a JSON array of exactly 5 "Critical Risks," each under 20 words.
    *   **Scoring Logic:** It will generate a score based on the number of risks found (0 risks = 100%, 5 risks = 20%).
*   **AI Idea Counselor:** Users can ask the AI follow-up questions for implementation plans, tool recommendations, market analysis, and more.

## Social & Collaboration Lab
The Social Lab is a rich, real-time collaborative environment.

*   **Social Feed:** A dynamic feed of "Idea Objects," which include `CreatorID`, `ForgeVersion`, `CollaborationStatus`, and a `Likes/Comments Array`.
*   **Kanban Board:** A drag-and-drop task board (using `dnd-kit` or `react-beautiful-dnd`) with "To Do", "In Progress", and "Done" columns. Task cards link to an expanded resource page.
*   **Team Chat with RAG:** A built-in chat for team communication. An AI bot will observe and participate using Retrieval-Augmented Generation (RAG) based on the project's editable plan.
    *   **"What's next?" Command:** When asked "What's next?", the AI will perform a semantic search against the `plan.md` (or MongoDB Atlas Vector Search) to provide a factual answer about the next task.

## Roles and Permissions
Role-based access control (e.g., Owner, Editor) will be handled by Clerk Auth.

## Technology & Hosting
*   **Frontend:** React (Web) & React Native (Mobile)
*   **Backend:** Node.js with Express
*   **Database:** MongoDB with GridFS for file storage.
*   **Vector Search:** MongoDB Atlas Vector Search for semantic search capabilities.
*   **Authentication:** Clerk Auth
*   **AI Model:** Gemini 2.5 Flash
*   **Hosting:** Render

## Target Users
*   Individual developers, entrepreneurs, startup teams, and venture capitalists.
