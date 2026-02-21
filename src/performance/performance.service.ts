import { Injectable } from '@nestjs/common';
import * as os from 'os';

@Injectable()
export class PerformanceService {
    getPerformance() {
        const time = new Date().toISOString().replace('Z', '').replace('T', ' ');
        const memoryUsage = process.memoryUsage().heapUsed;
        const memory = `${(memoryUsage / 1024 / 1024).toFixed(2)} MB`;
        const threads = os.cpus().length; // Commonly represents configurable threads in standard node setups

        return {
            time,
            memory,
            threads,
        };
    }
}
