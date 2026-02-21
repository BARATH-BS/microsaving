import { Injectable } from '@nestjs/common';
import { NpsReturnDto, IndexReturnDto } from './dto/return.dto';

@Injectable()
export class ReturnsService {
    nps(dto: NpsReturnDto) {
        return { message: 'NPS return dummy response', receivedDto: dto };
    }

    index(dto: IndexReturnDto) {
        return { message: 'Index return dummy response', receivedDto: dto };
    }
}
