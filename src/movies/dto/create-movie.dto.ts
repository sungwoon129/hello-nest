import { IsString, IsNumber, IsOptional } from 'class-validator';
import { Movie } from '../entity/movie.entity';

export class CreateMovieDto {
  @IsString()
  readonly title: string;

  @IsNumber()
  readonly year: number;

  @IsOptional()
  @IsString({ each: true })
  readonly genres: string[];

  @IsOptional()
  readonly movies: Movie[];
}
