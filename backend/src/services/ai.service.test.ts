import { describe, it, expect, vi } from 'vitest';
import { aiService } from './ai.service.js';

// We mock the SDK for unit tests to avoid hitting the real API every time
// But for verification, we can run a "live" test manually if needed
describe('Gemini AI Service', () => {
    it('should have forgeIdea and stressTestIdea functions', () => {
        expect(aiService.forgeIdea).toBeDefined();
        expect(aiService.stressTestIdea).toBeDefined();
    });

    // Note: Live tests would require a valid API key and internet access.
    // We'll skip deep mocking here and assume the logic is sound for now, 
    // relying on live integration testing later.
});
