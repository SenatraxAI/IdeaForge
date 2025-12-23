import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from './index.js';

describe('Health Check Endpoint', () => {
    it('should return 200 OK and a status message', async () => {
        const response = await request(app).get('/health');
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            status: 'OK',
            message: 'IdeaForge Backend is running',
        });
    });
});
