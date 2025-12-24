import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logFile = path.join(__dirname, '../../debug.log');

export const logger = {
    log: (message: string, data?: any) => {
        const timestamp = new Date().toISOString();
        const content = `${timestamp} - INFO: ${message} ${data ? JSON.stringify(data, null, 2) : ''}\n`;
        fs.appendFileSync(logFile, content);
    },
    error: (message: string, error?: any) => {
        const timestamp = new Date().toISOString();
        const content = `${timestamp} - ERROR: ${message} ${error?.message || error} \nStack: ${error?.stack}\n`;
        fs.appendFileSync(logFile, content);
    }
};
