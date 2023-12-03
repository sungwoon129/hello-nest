import { IsString, IsNumber, IsOptional } from 'class-validator';
import { Movie } from 'movies/entity/movie.entity';

export class CreateMovieDto {
  @IsString()
  readonly title: string;

  @IsNumber()
  readonly year: number;

  @IsOptional()
  @IsString({ each: true })
  readonly genres: string[];

  toEntity(): Movie {
    const instance = new Movie();
    instance.title = this.title;
    instance.year = this.year;
    instance.genres = this.genres;

    return instance;
  }
}
