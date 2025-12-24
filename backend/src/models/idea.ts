import { ObjectId } from 'mongodb';

export interface Idea {
    _id?: ObjectId;
    title: string;
    description: string;
    creatorId: string; // From Kinde
    forgeSpec?: {
        problem: string;
        solution: string;
        targetAudience: string;
        revenueModel: string;
        description: string;
        expansions?: {
            creativeFlow: string;
            techStack: string;
            growthLevers: string;
            unitEconomics: string;
            notes?: string;
        };
    };
    smallerSparks?: Array<{
        id: string;
        title: string;
        text: string;
        createdAt: Date;
    }>;
    risks?: Array<{
        risk: string;
    }>;
    killSwitch?: string; // The single most likely point of failure
    realityCheck?: string; // Blunt assessment of delusions
    score?: number;
    roadmap?: Array<{
        id: string;
        phase: string;
        task: string;
        depth: string;
    }>; // Evolutionary Mind-Map
    deepDive?: {
        executiveSummary: string;
        problemAnalysis: { statement: string; evidence: string; urgency: string };
        solutionArchitecture: { valueProposition: string; keyFeatures: string[]; technicalApproach: string };
        marketOpportunity: { tam: string; sam: string; som: string; trends: string };
        competitiveLandscape: { directCompetitors: string[]; advantage: string; moat: string };
        businessModel: { revenueStreams: string; pricing: string; unitEconomics: string };
        goToMarket: { segments: string; channels: string; strategy: string };
        financialProjections: { year1: string; year2: string; year3: string; breakeven: string };
        riskAssessment: { risks: Array<{ risk: string; mitigation: string }> };
        successMetrics: { northStar: string; kpis: string[] };
    };
    marketResearch?: {
        competitors: string[];
        trends: string[];
        lastResearched: Date;
        context: string; // Summarized search snippets
    };
    viabilityBreakdown?: {
        market: number;
        competition: number;
        revenue: number;
        feasibility: number;
        safety: number;
    };
    pillarReasons?: {
        [key: string]: string;
    };
    evolutionHistory?: Array<{
        score: number;
        date: Date;
        title: string;
        description: string;
    }>;
    createdAt: Date;
    updatedAt: Date;
}
