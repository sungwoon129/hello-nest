import { Injectable, NotFoundException } from '@nestjs/common';
import { Movie } from './entity/movie.entity';
import { UpdateMovieDto } from './dto/update-movie.dto';

@Injectable()
export class MoviesService {
  private movies: Movie[] = [];

  getAll(): Movie[] {
    return this.movies;
  }

  getOne(id: number): Movie {
    const movie = this.movies.find((movie) => movie.id === id);
    if (!movie) throw new NotFoundException(`Movie with ID ${id} not found.`);
    return movie;
  }

  update(movieId: number, updateData: UpdateMovieDto) {
    const movie = this.getOne(movieId);
    this.deleteOne(movieId);
    this.movies.push({ ...movie, ...updateData });
  }
  search(searchingYear: string): Movie[] {
    throw new Error('Method not implemented.');
  }
  deleteOne(movieId: number) {
    this.getOne(movieId);
    this.movies = this.movies.filter((movie) => movie.id !== movieId);
  }
  create(movieData) {
    this.movies.push({
      id: this.movies.length + 1,
      ...movieData,
    });
  }
}
