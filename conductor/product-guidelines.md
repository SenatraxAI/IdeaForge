# Product Guidelines: IdeaForge

## Tone and Voice
IdeaForge will communicate with its users using a tone that is:
*   **Informative & Professional:** Emphasizing clarity, accuracy, and expertise, fitting for a tool focused on idea validation and development.
*   **Encouraging & Supportive:** Fostering a positive and motivating environment for users to develop ideas and collaborate effectively.
*   **Innovative & Visionary:** Highlighting the cutting-edge AI capabilities and the forward-thinking nature of building in public.

## Visual Identity and Design Principles
The primary design principle for IdeaForge's UI will be:
*   **Minimalist & Clean:** Focusing on content and functionality with generous white space and a simple color palette to enhance user focus and reduce cognitive load. This aligns with the platform's "Focus Mode" and professional tone.

## Content Moderation and Community Interaction
To maintain a positive and productive environment in the Social Lab, IdeaForge will implement the following:

*   **User Reporting & Manual Moderation:** Every "Idea Object" or comment will include a "Flag" or "Report" button. Reported data will be stored in a "Reports" collection within MongoDB for review by an administrative team. This ensures accountability and allows for human judgment on complex cases.
*   **AI-Assisted Content Filtering:** Leveraging Gemini's `safetySettings`, content will be pre-screened to automatically block or flag toxic or inappropriate material before it is even stored in the database. This acts as a "pre-moderation" step, keeping the Social Lab clean and reducing the workload for human moderators.
*   **Clear Community Guidelines:** Explicit rules of conduct will be published and actively enforced. For an entrepreneur-focused application, these guidelines will specifically encourage "Constructive Criticism" and discourage "Trolling" or unproductive negativity, fostering a respectful and growth-oriented community.
