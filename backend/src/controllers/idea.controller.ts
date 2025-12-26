import { Request, Response } from 'express';
import { getDb } from '../config/db.js';
import { ObjectId } from 'mongodb';
import { aiService } from '../services/ai.service.js';
import { searchService } from '../services/search.service.js';
import { logger } from '../utils/logger.js';

export const ideaController = {
    /**
     * Creates a new rough idea.
     */
    async create(req: Request, res: Response) {
        try {
            const { title, description } = req.body;
            const creatorId = (req as any).user.sub; // From Kinde JWT

            if (!title || !description) {
                return res.status(400).json({ message: 'Title and description are required.' });
            }

            const db = getDb();
            const newIdea = {
                title,
                description,
                creatorId,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            const result = await db.collection('ideas').insertOne(newIdea);

            console.log(`[DEBUG] New Spark Created: ${title} | User: ${creatorId} | ID: ${result.insertedId}`);

            res.status(201).json({ ...newIdea, _id: result.insertedId });
        } catch (error) {
            console.error('Create Idea Error:', error);
            res.status(500).json({ message: 'Failed to save the idea spark.' });
        }
    },

    /**
     * Lists all ideas for the logged-in user.
     */
    async list(req: Request, res: Response) {
        try {
            const creatorId = (req as any).user.sub;
            const db = getDb();
            const ideas = await db.collection('ideas').find({ creatorId }).sort({ createdAt: -1 }).toArray();

            console.log(`[DEBUG] Listing sparks for User: ${creatorId} | Found: ${ideas.length}`);

            res.status(200).json(ideas);
        } catch (error) {
            console.error('List Ideas Error:', error);
            res.status(500).json({ message: 'Failed to retrieve your notebook.' });
        }
    },

    /**
     * Triggers the "Forge" engine to expand an idea with market evidence.
     */
    async forge(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const creatorId = (req as any).user.sub;
            const db = getDb();

            const { redo } = req.query;
            const idea = await db.collection('ideas').findOne({ _id: new ObjectId(id), creatorId });
            if (!idea) {
                return res.status(404).json({ message: 'Idea not found.' });
            }

            // NEURAL RESEARCH CACHING (Read-Only for Forge)
            // We do NOT trigger search here. Only Stress Test triggers search.
            let marketResearch = idea.marketResearch;
            if (!marketResearch) {
                marketResearch = { context: "Preliminary analysis pending Validation." };
            }

            /* Logic moved to Stress Test only
            if (isCacheExpired) {
                const research = await searchService.researchMarket(idea.title, idea.description);
                marketResearch = {
                    ...research,
                    lastResearched: new Date()
                };
            }
            */

            const forgeSpec = await aiService.forgeIdea(idea.title, idea.description, marketResearch.context);

            const updateDoc: any = {
                $set: { forgeSpec, marketResearch, updatedAt: new Date() }
            };

            // If redoing, clear the previous evolution analysis
            if (redo === 'true') {
                updateDoc.$unset = {
                    score: "",
                    viabilityBreakdown: "",
                    pillarReasons: "",
                    risks: "",
                    roadmap: "",
                    deepDive: ""
                };
            }

            await db.collection('ideas').updateOne(
                { _id: new ObjectId(id) },
                updateDoc
            );

            res.status(200).json({ forgeSpec, marketResearch });
        } catch (error) {
            console.error('Forge Idea Error:', error);
            res.status(500).json({ message: 'The Forge encountered an error: ' + (error instanceof Error ? error.message : String(error)) });
        }
    },

    /**
     * Triggers the "Stress-Tester" to find flaws and generate a viability roadmap.
     */
    async stressTest(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const creatorId = (req as any).user.sub;
            const db = getDb();

            const { redo } = req.query;
            const idea = await db.collection('ideas').findOne({ _id: new ObjectId(id), creatorId });
            if (!idea || !idea.forgeSpec) {
                return res.status(400).json({ message: 'Idea needs to be forged before stress-testing.' });
            }

            // NEURAL RESEARCH CACHING
            let marketResearch = idea.marketResearch;
            const cacheDuration = 7 * 24 * 60 * 60 * 1000; // 7 days
            const isCacheExpired = redo === 'true' || !marketResearch || (new Date().getTime() - new Date(marketResearch.lastResearched).getTime() > cacheDuration);

            if (isCacheExpired) {
                const research = await searchService.researchMarket(idea.title, idea.description);
                marketResearch = {
                    ...research,
                    lastResearched: new Date()
                };
            }

            // Perform the deep analysis (INCLUDES DEEP DIVE NOW)
            const analysis = await aiService.stressTestIdea(idea.title, idea.forgeSpec, marketResearch.context, idea.smallerSparks);

            // Use the Deep Dive from the single-pass analysis
            const deepDive = analysis.deepDive;

            // Prepare history Snapshot if score exists
            const historyItem = idea.score !== undefined ? {
                score: idea.score,
                date: idea.updatedAt || new Date(),
                title: idea.title,
                description: idea.description
            } : null;

            const updateDoc: any = {
                $set: {
                    marketResearch,
                    risks: analysis.risks,
                    score: analysis.score,
                    killSwitch: analysis.killSwitch,
                    realityCheck: analysis.realityCheck,
                    viabilityBreakdown: analysis.viabilityBreakdown,
                    pillarReasons: analysis.pillarReasons,
                    roadmap: analysis.roadmap,
                    deepDive: deepDive,
                    updatedAt: new Date()
                }
            };

            if (historyItem) {
                updateDoc.$push = { evolutionHistory: historyItem };
            }

            await db.collection('ideas').updateOne(
                { _id: new ObjectId(id) },
                updateDoc
            );

            res.status(200).json({
                ...analysis,
                deepDive
            });
        } catch (error) {
            console.error('Stress-Test Error:', error);
            res.status(500).json({ message: 'The Stress-Tester encountered an error: ' + (error instanceof Error ? error.message : String(error)) });
        }
    },

    /**
     * Consults the AI about the idea.
     */
    async consult(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { query, section, chatHistory } = req.body;
            const creatorId = (req as any).user.sub;
            const db = getDb();

            const idea = await db.collection('ideas').findOne({ _id: new ObjectId(id), creatorId });
            if (!idea) {
                return res.status(404).json({ message: 'Idea not found.' });
            }

            const answer = await aiService.consultOnIdea(idea, query, section, chatHistory);
            res.status(200).json({ answer });
        } catch (error: any) {
            logger.error('Consult Error:', error);
            res.status(500).json({ message: 'The Neural Architect is offline.' });
        }
    },

    /**
     * Applies AI refinements to a section.
     */
    async refine(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { section, instruction } = req.body;
            const creatorId = (req as any).user.sub;
            const db = getDb();

            const idea = await db.collection('ideas').findOne({ _id: new ObjectId(id), creatorId });
            if (!idea) {
                return res.status(404).json({ message: 'Idea not found.' });
            }

            // Direct update for forgeSpec (inline editing)
            if (section === 'forgeSpec') {
                const updatedSpec = JSON.parse(instruction);
                await db.collection('ideas').updateOne(
                    { _id: new ObjectId(id) },
                    {
                        $set: {
                            forgeSpec: updatedSpec,
                            updatedAt: new Date()
                        }
                    }
                );
                return res.status(200).json({ updates: updatedSpec });
            }

            // Strategic Evolution (Merging insights into ONLY expansions)
            if (section === 'evolution') {
                const updatedExpansions = await aiService.updateExpansionsStrategically(idea, instruction);
                const finalUpdates = { expansions: updatedExpansions };

                await db.collection('ideas').updateOne(
                    { _id: new ObjectId(id) },
                    {
                        $set: {
                            "forgeSpec.expansions": updatedExpansions,
                            updatedAt: new Date()
                        }
                    }
                );
                return res.status(200).json({ updates: finalUpdates });
            }

            // AI-powered refinement for other sections
            const updates = await aiService.applyRefinement(idea, section, instruction);

            // Apply updates to forgeSpec
            await db.collection('ideas').updateOne(
                { _id: new ObjectId(id) },
                {
                    $set: {
                        forgeSpec: { ...idea.forgeSpec, ...updates },
                        updatedAt: new Date()
                    }
                }
            );

            res.status(200).json({ updates });
        } catch (error) {
            console.error('Refine Error:', error);
            res.status(500).json({ message: 'Refinement failed.' });
        }
    },

    /**
     * Updates an idea's title or description.
     */
    async update(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { title, description } = req.body;
            const creatorId = (req as any).user.sub;
            const db = getDb();

            const result = await db.collection('ideas').updateOne(
                { _id: new ObjectId(id), creatorId },
                { $set: { title, description, updatedAt: new Date() } }
            );

            if (result.matchedCount === 0) {
                return res.status(404).json({ message: 'Idea not found.' });
            }

            res.status(200).json({ message: 'Idea updated successfully.' });
        } catch (error) {
            console.error('Update Idea Error:', error);
            res.status(500).json({ message: 'Failed to update the idea.' });
        }
    },

    /**
     * Deletes an idea.
     */
    async delete(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const creatorId = (req as any).user.sub;
            const db = getDb();

            const result = await db.collection('ideas').deleteOne({ _id: new ObjectId(id), creatorId });
            if (result.deletedCount === 0) {
                return res.status(404).json({ message: 'Idea not found.' });
            }

            res.status(200).json({ message: 'Idea deleted successfully.' });
        } catch (error) {
            console.error('Delete Idea Error:', error);
            res.status(500).json({ message: 'Failed to delete the idea.' });
        }
    },

    async addSpark(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { text, title } = req.body;
            const creatorId = (req as any).user.sub;
            const db = getDb();

            if (!text) {
                return res.status(400).json({ message: 'Spark text is required.' });
            }

            const spark = {
                id: new ObjectId().toHexString(),
                title: title || 'New Spark',
                text,
                createdAt: new Date()
            };

            const result = await db.collection('ideas').updateOne(
                { _id: new ObjectId(id), creatorId },
                {
                    $push: { smallerSparks: spark } as any,
                    $set: { updatedAt: new Date() }
                }
            );

            if (result.matchedCount === 0) {
                return res.status(404).json({ message: 'Idea not found.' });
            }

            res.status(200).json({ spark });
        } catch (error) {
            console.error('Add Spark Error:', error);
            res.status(500).json({ message: 'Failed to save spark.' });
        }
    },

    async deleteSpark(req: Request, res: Response) {
        try {
            const { id, sparkId } = req.params;
            const creatorId = (req as any).user.sub;
            const db = getDb();

            const result = await db.collection('ideas').updateOne(
                { _id: new ObjectId(id), creatorId },
                {
                    $pull: { smallerSparks: { id: sparkId } } as any,
                    $set: { updatedAt: new Date() }
                }
            );

            if (result.matchedCount === 0) {
                return res.status(404).json({ message: 'Idea not found.' });
            }

            res.status(200).json({ message: 'Spark removed.' });
        } catch (error) {
            console.error('Delete Spark Error:', error);
            res.status(500).json({ message: 'Failed to remove spark.' });
        }
    }
};
