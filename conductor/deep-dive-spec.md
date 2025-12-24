# Solution Deep Dive - Investor-Grade PRD Specification

## Overview
The Solution Deep Dive is a comprehensive, investor-grade Product Requirements Document (PRD) generated after stress-testing an idea. It transforms the basic Core Specification into a complete venture-ready analysis.

## Workflow Changes

### Phase 1: Forge (Initial Scaffolding)
**Output:** Core Specification Card ONLY
- **Editable Fields:**
  - Problem Statement
  - Solution Overview
  - Target Audience
  - Revenue Model
- **Edit Mode:** Direct inline editing with pen icon (no chat)
- **Purpose:** User refines the basic scaffolding before deep analysis

### Phase 2: Stress Test → Deep Dive Generation
**Trigger:** User clicks "Start Evolution Analysis"
**Process:**
1. AI performs viability analysis (existing)
2. AI generates comprehensive Deep Dive using:
   - Core Specification
   - Market Research data
   - Viability Breakdown scores
   - Pillar Reasons
   - Competitive Intelligence
   - Roadmap phases

## Deep Dive Structure (Investor-Grade PRD)

### 1. Executive Summary (200-300 words)
- One-paragraph elevator pitch
- Key value proposition
- Market opportunity size
- Unique competitive advantage

### 2. Problem Analysis
- **Problem Statement:** Detailed friction being solved
- **Market Evidence:** Data supporting problem significance
- **Current Solutions:** Why existing solutions fail
- **Urgency:** Why now is the right time

### 3. Solution Architecture
- **Core Value Proposition:** What makes this unique
- **Key Features:** 3-5 critical capabilities
- **User Experience:** How users interact
- **Technical Approach:** High-level architecture
- **Underlying Magic:** Secret sauce/IP

### 4. Market Opportunity
- **TAM (Total Addressable Market):** Total market size
- **SAM (Serviceable Available Market):** Realistic target
- **SOM (Serviceable Obtainable Market):** 3-year goal
- **Market Trends:** Supporting tailwinds
- **Growth Drivers:** What accelerates adoption

### 5. Competitive Landscape
- **Direct Competitors:** Main players (from market research)
- **Indirect Competitors:** Alternative solutions
- **Competitive Matrix:** Feature comparison
- **Sustainable Advantage:** Why we win long-term
- **Barriers to Entry:** What protects the moat

### 6. Business Model
- **Revenue Streams:** How money is made
- **Pricing Strategy:** Price points and tiers
- **Unit Economics:**
  - Customer Acquisition Cost (CAC)
  - Lifetime Value (LTV)
  - LTV:CAC Ratio
- **Distribution Channels:** How we reach customers
- **Scalability:** Path to profitability

### 7. Go-to-Market Strategy
- **Target Customer Segments:** Prioritized personas
- **Marketing Channels:** Acquisition strategy
- **Sales Strategy:** B2B vs B2C approach
- **Launch Plan:** Phased rollout
- **Partnerships:** Strategic alliances

### 8. Product Roadmap (from Evolution Atlas)
- **Phase 1-5:** Detailed milestones
- **Timeline:** Estimated dates
- **Resource Requirements:** Team/budget needs
- **Success Metrics:** KPIs per phase

### 9. Financial Projections (3-Year)
- **Revenue Forecast:** Conservative/Aggressive scenarios
- **Cost Structure:** Fixed vs Variable
- **Burn Rate:** Monthly cash needs
- **Break-even Analysis:** When profitability hits
- **Funding Requirements:** Capital needed

### 10. Risk Assessment
- **Critical Risks:** From stress test (with mitigation)
- **Market Risks:** Demand/competition
- **Technical Risks:** Execution challenges
- **Regulatory Risks:** Compliance issues
- **Mitigation Strategies:** How we de-risk

### 11. Success Metrics
- **North Star Metric:** Primary success indicator
- **Key Performance Indicators:**
  - User acquisition
  - Retention rate
  - Revenue per user
  - Churn rate
- **Release Criteria:** What defines success

### 12. Team & Execution
- **Required Expertise:** Key roles needed
- **Advisor Network:** Strategic mentors
- **Execution Timeline:** 12-month plan
- **Milestones:** Quarterly objectives

## Visual Elements

### Charts & Graphs
1. **Market Size Visualization:** TAM/SAM/SOM funnel
2. **Competitive Matrix:** Feature comparison grid
3. **Financial Projections:** 3-year revenue/cost chart
4. **User Growth:** Adoption curve projection
5. **Unit Economics:** CAC vs LTV over time

### Data Tables
1. **Viability Breakdown:** Scores with reasoning
2. **Competitor Analysis:** Feature-by-feature
3. **Pricing Tiers:** Comparison table
4. **Milestone Timeline:** Gantt-style roadmap

## UI/UX Design

### Collapsible Sections
- Each major section (1-12) is collapsible
- Default: First 2-3 lines visible with "Expand Full Analysis"
- Smooth accordion animation
- Section-specific edit/chat buttons

### Edit Capabilities
- **Core Specification:** Direct inline editing (pen icon)
- **Deep Dive Sections:** Chat-based refinement (MessageSquare icon)
- **Reasoning Cards:** Expandable with chat integration

### Visual Hierarchy
- **Typography:**
  - Section Headers: 24px, bold, uppercase tracking
  - Subsections: 16px, semi-bold
  - Body: 14px, regular, line-height 1.6
- **Color Coding:**
  - High scores (>80%): Yellow/Gold accents
  - Medium scores (50-80%): Blue accents
  - Low scores (<50%): Red accents
- **Spacing:**
  - Section padding: 48px vertical
  - Subsection padding: 24px vertical
  - Card margins: 16px

### Glassmorphism Style
- Background: `bg-white/[0.01]`
- Border: `border-white/[0.05]`
- Backdrop blur: `backdrop-blur-xl`
- Subtle glow for high-viability ideas

## AI Prompt Structure

```
You are "Venture Analyst", creating an investor-grade PRD.

INPUTS:
- Core Spec: ${forgeSpec}
- Market Research: ${marketResearch}
- Viability Scores: ${viabilityBreakdown}
- Pillar Reasoning: ${pillarReasons}
- Roadmap: ${roadmap}
- Risks: ${risks}

Generate a comprehensive Deep Dive with:
1. Executive Summary (200-300 words)
2. Problem Analysis (with market evidence)
3. Solution Architecture (technical + UX)
4. Market Opportunity (TAM/SAM/SOM with data)
5. Competitive Landscape (matrix + moat)
6. Business Model (unit economics)
7. Go-to-Market Strategy
8. Product Roadmap (from existing roadmap)
9. Financial Projections (3-year)
10. Risk Assessment (from existing risks + mitigation)
11. Success Metrics (KPIs)
12. Team & Execution

Return JSON:
{
  "executiveSummary": "...",
  "problemAnalysis": {...},
  "solutionArchitecture": {...},
  "marketOpportunity": {...},
  "competitiveLandscape": {...},
  "businessModel": {...},
  "goToMarket": {...},
  "financialProjections": {...},
  "riskAssessment": {...},
  "successMetrics": {...},
  "teamExecution": {...}
}
```

## Implementation Checklist

### Backend
- [ ] Update `stressTestIdea` to generate Deep Dive
- [ ] Add `deepDive` field to Idea model
- [ ] Save Deep Dive to database
- [ ] Create endpoint for updating Core Spec inline

### Frontend
- [ ] Hide all cards except Core Spec after Forge
- [ ] Make Core Spec fields inline-editable
- [ ] Generate Deep Dive after stress test
- [ ] Create collapsible section components
- [ ] Add charts/graphs for visual data
- [ ] Implement section-specific chat context
- [ ] Add export to PDF functionality (future)

### Testing
- [ ] Test Forge → Core Spec only
- [ ] Test inline editing of Core Spec
- [ ] Test Stress Test → Deep Dive generation
- [ ] Test collapsible sections
- [ ] Test chat integration per section
- [ ] Verify visual hierarchy and spacing

## Success Criteria
1. After Forge: Only Core Specification visible
2. Core Spec: Inline editing works smoothly
3. After Stress Test: Deep Dive appears with all 12 sections
4. Each section: Collapsible with smooth animation
5. Visual elements: Charts render correctly
6. Chat integration: Context-aware per section
7. Overall: Looks like a professional investor deck
