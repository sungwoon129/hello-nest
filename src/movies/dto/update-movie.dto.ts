import { PartialType } from '@nestjs/mapped-types';
import { CreateMovieDto } from './create-movie.dto';
import { IsOptional } from 'class-validator';
import { Theater } from 'src/theaters/entity/theaters.entity';

export class UpdateMovieDto extends PartialType(CreateMovieDto) {
  @IsOptional()
  readonly theaters: Theater[];
}
