import { Injectable } from '@nestjs/common';

@Injectable()
export class PerformanceService {
    getPerformance() {
        return { message: 'Performance dummy response' };
    }
}
