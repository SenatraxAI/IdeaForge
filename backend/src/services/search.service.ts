import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Service to handle Market Research using search engines (Tavily).
 */
export const searchService = {
    async researchMarket(title: string, description: string) {
        const query = `top 5 market outlooks and viability risks for idea: ${title} - ${description.slice(0, 100)}`;
        console.log(`[Neural Research] Live Search for: ${query}`);

        if (!process.env.TAVILY_API_KEY) {
            console.error("CRITICAL: TAVILY_API_KEY is missing from process.env");
            throw new Error("Tavily API Key is missing. Check backend .env file.");
        }

        try {
            const response = await axios.post('https://api.tavily.com/search', {
                api_key: process.env.TAVILY_API_KEY,
                query: query,
                search_depth: "advanced",
                max_results: 5,
                include_answer: true
            });

            const { results, answer } = response.data;

            // Extract clean competitors and trends from results
            const competitors = results.slice(0, 3).map((r: any) => new URL(r.url).hostname.replace('www.', ''));
            const trends = ["Market Growth", "AI Integration", "User-Centric Design"]; // Defaulting trends if not explicitly in result titles

            return {
                competitors: competitors.length > 0 ? competitors : ["Niche Players", "Emerging Tech"],
                trends: results.slice(0, 3).map((r: any) => r.title.split(' ').slice(0, 2).join(' ')),
                context: answer || results.map((r: any) => r.content).join('\n\n')
            };
        } catch (error) {
            console.error('Tavily Research Error:', error);
            // Fallback to simulation if API fails so the app doesn't break
            return {
                competitors: ["Competitor Discovery Failed"],
                trends: ["Market Sentiment Analysis"],
                context: "Live research currently unavailable. Analysis based on general AI knowledge."
            };
        }
    }
};
