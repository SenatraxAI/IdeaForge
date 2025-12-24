import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { searchService } from "./search.service.js";
import dotenv from 'dotenv';
import { logger } from "../utils/logger.js";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// Tool-enabled model for consultation
const modelWithTools = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    tools: [{
        functionDeclarations: [{
            name: "marketResearch",
            description: "Performs live market research using Tavily search to get real-world data, competitors, and trends.",
            parameters: {
                type: SchemaType.OBJECT,
                properties: {
                    query: { type: SchemaType.STRING, description: "The specific market research query." }
                },
                required: ["query"]
            }
        }]
    }]
});

// Rate limit handling helper
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function retry<T>(fn: () => Promise<T>, retries = 5, initialDelay = 2000): Promise<T> {
    let currentDelay = initialDelay;
    for (let i = 0; i < retries; i++) {
        try {
            return await fn();
        } catch (error: any) {
            const message = error.message || '';
            const isRateLimit = message.includes('429') || message.includes('retry') || error.status === 429;

            if (i === retries - 1 || !isRateLimit) throw error;

            // Extract wait time if provided (e.g., "Please retry in 43.89s")
            const match = message.match(/retry in ([0-9.]+)s/);
            if (match && match[1]) {
                const waitSeconds = parseFloat(match[1]);
                console.log(`[AI Retry] API requested wait of ${waitSeconds}s. Pausing...`);
                await delay((waitSeconds + 1) * 1000); // Wait suggested time + 1s buffer
                currentDelay = initialDelay; // Reset backoff after a respectful wait
            } else {
                console.log(`[AI Retry] Rate limit hit. Retrying in ${currentDelay}ms...`);
                await delay(currentDelay);
                currentDelay *= 2; // Exponential backoff
            }
        }
    }
    throw new Error("Max retries exceeded");
}

export const aiService = {
    /**
     * Develops a rough spark into a full Product Specification.
     */
    async forgeIdea(title: string, description: string, researchContext?: string) {
        const prompt = `
            You are "Venty", an expert product strategist and VC mentor.
            Expand this idea spark into a professional product specification.
            
            IDEA: "${title}" - "${description}"
            ${researchContext ? `MARKET CONTEXT:\n${researchContext}` : ''}

            Return ONLY a valid JSON object:
            {
                "problem": "The specific friction being solved",
                "solution": "The unique value proposition",
                "targetAudience": "The specific market segment",
                "revenueModel": "How this actually makes money",
                "description": "A 100-word professional deep dive into the product",
                "expansions": {
                    "creativeFlow": "Describe the high-fidelity user journey from intent to completion",
                    "techStack": "List core technologies, APIs, and AI models required",
                    "growthLevers": "Key drivers for virality and customer acquisition",
                    "unitEconomics": "Estimated cost structure and pricing logic"
                }
            }
        `;

        try {
            const result = await retry(() => model.generateContent(prompt));
            const text = result.response.text();
            return JSON.parse(text.replace(/```json|```/g, '').trim());
        } catch (error) {
            console.error('Gemini Forge Error:', error);
            throw new Error('AI Forge failed: ' + (error instanceof Error ? error.message : String(error)));
        }
    },

    /**
     * Performs a deep-dive stress test and generates an Evolutionary Roadmap.
     */
    async stressTestIdea(title: string, forgeSpec: any, researchContext?: string, smallerSparks?: any[]) {
        const prompt = `
            You are "The Adversary". You are NOT a mentor. You are a skeptical, cynical Venture Capitalist who looks for reasons to say "NO".
            Your goal is to destroy this startup idea: "${title}".
            
            SPEC: ${JSON.stringify(forgeSpec)}
            ${researchContext ? `MARKET CONTEXT:\n${researchContext}` : ''}
            ${smallerSparks && smallerSparks.length > 0 ? `SMALLER SPARKS (Pivots/Notes/Agreements):\n${JSON.stringify(smallerSparks)}` : ''}
            ${forgeSpec.expansions?.notes ? `CRITICAL USER NOTES (PRIORITY #1):\n"${forgeSpec.expansions.notes}"` : ''}

            Perform a brutal stress-test. Assume the idea will fail. Find the delusions.
            
            IMPORTANT SCORING RULES (PESSIMISTIC DEFICIT):
            - Start at 50%.
            - Deduct points for generic claims ("we will use AI", "viral growth").
            - Deduct points for crowded markets without a clear moat.
            - ONLY award points > 60 if there is concrete evidence of a competitive advantage.
            - ONLY award points > 80 if the idea is "Investment Grade" (proven demand, technical moat, unicorn potential).
            - < 30: "Market Mirage" (Foundational flaws)
            - 30-60: "High Friction" (Significant hurdles)
            - 60-80: "Venture Solid" (Good, but needs execution)
            - 80+: "Investment Grade" (Exceptional)

            MANDATORY FIELDS:
            - "killSwitch": Identify the SINGLE most likely cause of death for this venture (e.g., "CAC > LTV", "Regulatory Ban", "Google builds this feature").
            - "realityCheck": A blunt, 1-sentence reality check addressing the founder's biggest delusion.

            Generate an EVOLUTIONARY ROADMAP consisting of EXACTLY 10 highly detailed phases to fix these flaws.
            
            ALSO GENERATE A "DEEP DIVE" INVESTOR MEMO:
            - "executiveSummary": 2-3 sentences.
            - "problemAnalysis": { statement, evidence, urgency }
            - "solutionArchitecture": { valueProposition, keyFeatures, technicalApproach }
            - "marketOpportunity": { tam, sam, som, trends }
            - "competitiveLandscape": { directCompetitors, advantage, moat }
            - "businessModel": { revenueStreams, pricing, unitEconomics }
            - "goToMarket": { segments, channels, strategy }
            - "financialProjections": { year1, year2, year3, breakeven }
            - "riskAssessment": { risks: Array<{ risk, mitigation }> }
            - "successMetrics": { northStar, kpis }
            
            IMPORTANT: Your analysis and roadmap MUST take the "CRITICAL USER NOTES" into account. If the notes conflict with specific assumptions, the notes WIN, but you should still critique the execution.

            Return ONLY a valid JSON object:
            {
                "score": number (0-100),
                "killSwitch": "The single most likely point of failure",
                "realityCheck": "Blunt assessment of the biggest delusion",
                "viabilityBreakdown": {
                    "Market Dynamics": number,
                    "Competitive Landscape": number,
                    "Revenue Architecture": number,
                    "Technical Feasibility": number,
                    "Risk Mitigation": number
                },
                "pillarReasons": {
                    "Market Dynamics": "Why you deducted points here.",
                    "Competitive Landscape": "Why you deducted points here.",
                    "Revenue Architecture": "Why you deducted points here.",
                    "Technical Feasibility": "Why you deducted points here.",
                    "Risk Mitigation": "Why you deducted points here."
                },
                "risks": [{"risk": "string", "impact": "High|Med|Low"}],
                "roadmap": [
                    {
                        "id": "phase-1",
                        "phase": "Strategic Foundation",
                        "task": "Essential first step",
                        "depth": "A very detailed, multi-step guide on how to survive the kill switch."
                    },
                    "... and so on for phases 2 through 10"
                ],
                "deepDive": {
                   "executiveSummary": "string",
                   "problemAnalysis": { "statement": "string", "evidence": "string", "urgency": "string" },
                   "solutionArchitecture": { "valueProposition": "string", "keyFeatures": ["string"], "technicalApproach": "string" },
                   "marketOpportunity": { "tam": "string", "sam": "string", "som": "string", "trends": "string" },
                   "competitiveLandscape": { "directCompetitors": ["string"], "advantage": "string", "moat": "string" },
                   "businessModel": { "revenueStreams": "string", "pricing": "string", "unitEconomics": "string" },
                   "goToMarket": { "segments": "string", "channels": "string", "strategy": "string" },
                   "financialProjections": { "year1": "string", "year2": "string", "year3": "string", "breakeven": "string" },
                   "riskAssessment": { "risks": [{"risk": "string", "mitigation": "string"}] },
                   "successMetrics": { "northStar": "string", "kpis": ["string"] }
                }
            }
        `;

        try {
            const result = await retry(() => model.generateContent(prompt));
            const text = result.response.text();
            return JSON.parse(text.replace(/```json|```/g, '').trim());
        } catch (error) {
            console.error('AI Stress-Test Error:', error);
            throw new Error('AI Stress-Test failed: ' + (error instanceof Error ? error.message : String(error)));
        }
    },

    /**
     * Consults on specific aspects of the idea context with chat memory.
     */
    async consultOnIdea(context: any, query: string, section?: string, chatHistory?: Array<{ role: string, text: string }>) {
        const historyContext = ''; // Redundant with native history

        const prompt = `
            You are "Venty", a helpful, creative, and strict VC mentor (think Y Combinator).
            Your job is to help the user build their idea into a world-class product.
            
            CORE MISSION:
            - **Push forward**: Keep the user moving towards execution and shipping.
            - **Viability Goal**: If the current viability score (Analysis.score) is below 80, your primary objective is to suggest improvements to get it above 80.
            - **Success Driven**: Ensure the user hits their success metrics and stays focused on what matters.
            - **Live Intel**: Use your search tool to get real-world data if the user asks for evidence or if you need to verify a market claim.
            - **Agreements & Summaries**: If you and the user agree on a pivot, a new feature, or a significant change, offer to save it as a "Resolution". 

            PERSONALITY:
            - Conversational and supportive, like a friend or mentor.
            - Professional and serious about the business logic.
            - Brutally honest and strict when the idea lacks depth or viability—don't sugarcoat risks.
            - Creative in suggesting pivots or unique growth loops.

            PROJECT CONTEXT:
            Title: ${context.title}
            Description: ${context.description}
            Spec: ${JSON.stringify(context.forgeSpec || {})}
            Analysis: ${JSON.stringify({ score: context.score, breakdown: context.viabilityBreakdown })}
            Roadmap: ${JSON.stringify(context.roadmap || [])}
            Metrics: ${JSON.stringify(context.deepDive?.successMetrics || {})}
            Smaller Sparks (Pivots/Notes): ${JSON.stringify(context.smallerSparks || [])}
            Market Research (Cached): "${context.marketResearch?.context || 'No specific research available yet.'}"
            
            USER QUERY ${section ? `(Regarding ${section})` : ''}: "${query}"
            
            Provide a strategic, high-value answer. Be direct, actionable, and conversational.
            - DO NOT return JSON unless you are specifically suggesting a data update OR a Resolution. 
            - If you are suggesting a data update to the core spec, put the JSON block at the end (e.g., \`\`\`json {"solution": "..."} \`\`\`).
            - If you want to suggest saving an agreement as a spark, return \`\`\`json {"newSpark": "Summary of agreement..."} \`\`\`.
            - Use Markdown for formatting (headers, bold, lists) for the conversational part.
            - Maintain context from previous messages.
        `;

        try {
            // Map history to Gemini format
            let geminiHistory = (chatHistory || []).map(m => ({
                role: m.role === 'user' ? 'user' : 'model',
                parts: [{ text: m.text }]
            }));

            // Gemini requires history to start with 'user'
            const firstUserIndex = geminiHistory.findIndex(m => m.role === 'user');
            if (firstUserIndex !== -1) {
                geminiHistory = geminiHistory.slice(firstUserIndex);
            } else {
                geminiHistory = [];
            }

            // Use standard model instead of modelWithTools to save quota (1 request vs 3 requests)
            // Tools trigger multiple round-trips which exhaust the 15 RPM limit instantly.
            const chat = model.startChat({
                history: geminiHistory
            });

            /* Tools disabled for Stability
            const toolHandlers: any = {
                marketResearch: async ({ query }: { query: string }) => {
                    const result = await searchService.researchMarket(query, "");
                    return { context: result.context };
                }
            };
            */

            let result = await retry(() => chat.sendMessage(prompt));
            let response = result.response;

            /* Tools disabled to prevent 429 Rate Limit on Free Tier
            // Handle tool calls loop
            let loopCount = 0;
            while (response.functionCalls()?.length && loopCount < 5) {
                loopCount++;
                const calls = response.functionCalls()!;
                console.log(`[AI Tool] Handling ${calls.length} tool calls`);

                const toolResponses = await Promise.all(calls.map(async (call) => {
                   // Tool logic would go here
                   return null;
                }));

                const filteredResponses = toolResponses.filter((r): r is any => r !== null);
                if (filteredResponses.length > 0) {
                     result = await chat.sendMessage(filteredResponses);
                     response = result.response;
                }
            }
            */

            const answer = response.text();
            logger.log(`AI Consult Success. Query: ${query}`);
            return answer;
        } catch (error: any) {
            logger.error(`AI Consult Error`, error);
            throw error;
        }
    },

    async updateExpansionsStrategically(idea: any, insight: string) {
        const prompt = `
            You are "Expansions Architect". Your goal is to strategically merge a new insight into the EXISTING product expansions.
            
            CORE IDEA: "${idea.title}"
            CORE SPEC: ${JSON.stringify({
            problem: idea.forgeSpec.problem,
            solution: idea.forgeSpec.solution,
            targetAudience: idea.forgeSpec.targetAudience,
            revenueModel: idea.forgeSpec.revenueModel
        })}

            CURRENT EXPANSIONS:
            ${JSON.stringify(idea.forgeSpec.expansions || {})}
            
            ${idea.forgeSpec.expansions?.notes ? `CRITICAL USER NOTES (PRIORITY #1):\n"${idea.forgeSpec.expansions.notes}"` : ''}

            NEW INSIGHT/INCLUSION:
            ${insight}
            INSTRUCTION:
            1. Analyze the new insight.
            2. Decide which field(s) in the expansion it best fits into (creativeFlow, techStack, growthLevers, unitEconomics).
            3. Update the fields strategically. DO NOT just append; integrate the thought professionally.
            4. IMPORTANT: If CRITICAL USER NOTES exist, ensure the update aligns with those directives. User notes take precedent over the new insight if there is a conflict.
            5. Keep the output professionally dense and investor-grade.
            
            Return ONLY the updated "expansions" object as valid JSON.
        `;

        try {
            const result = await retry(() => model.generateContent(prompt));
            const text = result.response.text();
            const cleaned = text.replace(/```json|```/g, '').trim();
            // Ensure we handle cases where the AI might return the whole expansions object or just a part
            const updates = JSON.parse(cleaned);

            // Clean up: If AI returned { "expansions": { ... } }, unwrap it
            return updates.expansions ? updates.expansions : updates;
        } catch (error) {
            console.error('Gemini Evolve Error:', error);
            throw new Error('AI Evolution failed');
        }
    },

    /**
     * Applies AI-suggested refinements to a specific section.
     */
    async applyRefinement(context: any, section: string, instruction: string) {
        const prompt = `
            You are refining the "${section}" section of this product idea.
            
            CURRENT CONTENT:
            ${JSON.stringify(context.forgeSpec || context)}

        INSTRUCTION: ${instruction}
            
            Return ONLY a JSON object with the updated field(s).For example:
        { "solution": "new solution text" }
        or
        { "problem": "refined problem statement", "targetAudience": "more specific audience" }
        `;

        try {
            const result = await retry(() => model.generateContent(prompt));
            const text = result.response.text();
            return JSON.parse(text.replace(/```json|```/g, '').trim());
        } catch (error) {
            console.error('AI Refinement Error:', error);
            throw new Error('AI Refinement failed.');
        }
    },

    /**
     * Generates comprehensive investor-grade Deep Dive PRD.
     */
    async generateDeepDive(idea: any, marketResearch: any, viabilityBreakdown: any, pillarReasons: any, roadmap: any, risks: any) {
        const prompt = `
            You are "Venture Analyst", creating an investor-grade Product Requirements Document (PRD).

            INPUTS:
            - Title: ${idea.title}
            - Core Spec: ${JSON.stringify(idea.forgeSpec)}
            - Market Research: ${JSON.stringify(marketResearch)}
            - Viability Scores: ${JSON.stringify(viabilityBreakdown)}
            - Pillar Reasoning: ${JSON.stringify(pillarReasons)}
            - Roadmap: ${JSON.stringify(roadmap)}
            - Risks: ${JSON.stringify(risks)}
            ${idea.forgeSpec.expansions?.notes ? `CRITICAL USER NOTES (PRIORITY #1):\n"${idea.forgeSpec.expansions.notes}"` : ''}
            ${idea.smallerSparks && idea.smallerSparks.length > 0 ? `SMALLER SPARKS (NAMED CONTEXT):\n${JSON.stringify(idea.smallerSparks)}` : ''}

            Generate a comprehensive, investor-grade Deep Dive across EXACTLY 10 sections. 
            Each section must be vivid, data-driven, and professionally dense. DO NOT use generic placeholders.
            
            IMPORTANT: Your PRD MUST take the "CRITICAL USER NOTES" and "SMALLER SPARKS" into account as the primary development directives. If these directives conflict with previous assumptions or research, THESE DIRECTIVES WIN.

            Return ONLY valid JSON in this exact structure:
        {
            "executiveSummary": "300-400 word compelling pitch. Cover the core problem, the innovative solution, precise market size, and your sustainable competitive advantage.",
                "problemAnalysis": {
                "statement": "A multi-paragraph, deep-dive into the specific market friction. Beyond 'people have a problem', explain the structural why.",
                    "evidence": "Concrete trends, psychological triggers, or market data supporting the significance of this friction.",
                        "urgency": "The 'Why Now?' analysis. Explain the tailwinds and convergence of factors making this the optimal time to strike."
            },
            "solutionArchitecture": {
                "valueProposition": "A high-fidelity value proposition statement that clearly defines the transformation for the user.",
                    "keyFeatures": ["Vivid Feature 1 with execution detail", "Vivid Feature 2 with execution detail", "Vivid Feature 3 with execution detail"],
                        "technicalApproach": "A detailed multi-paragraph blueprint. Explain the core tech stack, the secret sauce, and how the 'Neural Core' or specific AI/logic functions."
            },
            "marketOpportunity": {
                "tam": "Total Addressable Market (TAM) with a specific $ figure and a breakdown of the calculation logic.",
                    "sam": "Serviceable Available Market (SAM) - your realistic reach within 5 years with data-backed reasoning.",
                        "som": "Serviceable Obtainable Market (SOM) - your hyper-focused 18-month capture goal.",
                            "trends": "Key market tailwinds, regulatory shifts, or technological changes that act as drivers."
            },
            "competitiveLandscape": {
                "directCompetitors": ["Specific Competitor A (Analysis)", "Specific Competitor B (Analysis)", "Specific Competitor C (Analysis)"],
                    "advantage": "Your sustainable competitive advantage. Explain exactly why you win and how you defend.",
                        "moat": "Strategic barriers to entry, switching costs, or network effects that build your moat."
            },
            "businessModel": {
                "revenueStreams": "Detailed breakdown of pricing tiers, enterprise models, or secondary monetization routes.",
                    "pricing": "Specific price points, billing cycles, and value-based pricing strategy.",
                        "unitEconomics": "Estimated CAC (Customer Acquisition Cost), LTV (Lifetime Value), and the target LTV:CAC ratio with professional reasoning."
            },
            "goToMarket": {
                "segments": "Detailed customer personas in priority order (e.g., Early Adopters vs. Late Majority).",
                    "channels": "Specific marketing and distribution channels (e.g., SEO clusters, B2B partnerships, specific social strategies).",
                        "strategy": "Your step-by-step launch and expansion strategy. How you get the first 100, then 1000 users."
            },
            "financialProjections": {
                "year1": "Detailed projection for Year 1: Revenue targets, primary costs, and burn rate management.",
                    "year2": "Expansion Year 2: Scaled revenue goals, growth-driven costs, and market expansion targets.",
                        "year3": "Maturity Year 3: Profitability targets, sustained growth metrics, and scaling efficiency.",
                            "breakeven": "The specific path and timeline to breakeven, identifying the critical volume needed."
            },
            "riskAssessment": {
                "risks": [
                    { "risk": "High-impact Market/Adoption risk", "mitigation": "Strategic de-risking plan with specific actions" },
                    { "risk": "Substantial Technical/Operational risk", "mitigation": "Strategic de-risking plan with specific actions" },
                    { "risk": "Significant Competitive/Regulatory risk", "mitigation": "Strategic de-risking plan with specific actions" }
                ]
            },
            "successMetrics": {
                "northStar": "The single most important North Star metric that defines long-term value creation.",
                    "kpis": ["Specific KPI 1 with quantitative target", "Specific KPI 2 with quantitative target", "Specific KPI 3 with quantitative target"]
            }
        }
        `;

        try {
            const result = await retry(() => model.generateContent(prompt));
            const text = result.response.text();
            return JSON.parse(text.replace(/```json|```/g, '').trim());
        } catch (error) {
            console.error('Deep Dive Generation Error:', error);
            throw new Error('Deep Dive generation failed: ' + (error as Error).message);
        }
    }
};
