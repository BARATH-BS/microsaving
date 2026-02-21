import { Body, Controller, Post } from '@nestjs/common';
import { ReturnsService } from './returns.service';
import { NpsReturnDto, IndexReturnDto } from './dto/return.dto';

@Controller('returns')
export class ReturnsController {
    constructor(private readonly returnsService: ReturnsService) { }

    @Post('nps')
    nps(@Body() dto: NpsReturnDto) {
        return this.returnsService.nps(dto);
    }

    @Post('index')
    index(@Body() dto: IndexReturnDto) {
        return this.returnsService.index(dto);
    }
}
