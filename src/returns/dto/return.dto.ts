import { IsString, IsOptional } from 'class-validator';

export class NpsReturnDto {
    @IsString()
    @IsOptional()
    payload?: string;
}

export class IndexReturnDto {
    @IsString()
    @IsOptional()
    payload?: string;
}
