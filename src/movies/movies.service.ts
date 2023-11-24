import { Injectable, NotFoundException } from '@nestjs/common';
import { Movie } from './entity/movie.entity';

@Injectable()
export class MoviesService {
  private movies: Movie[] = [];

  getAll(): Movie[] {
    return this.movies;
  }

  getOne(id: string): Movie {
    const movie = this.movies.find((movie) => movie.id === +id);
    if (!movie) throw new NotFoundException(`Movie with ID ${id} not found.`);
    return movie;
  }

  update(movieId: string, updateData) {
    const movie = this.getOne(movieId);
    this.deleteOne(movieId);
    this.movies.push({ ...movie, ...updateData });
  }
  search(searchingYear: string): Movie[] {
    throw new Error('Method not implemented.');
  }
  deleteOne(movieId: string) {
    this.getOne(movieId);
    this.movies = this.movies.filter((movie) => movie.id !== +movieId);
  }
  create(movieData: any) {
    this.movies.push({
      id: this.movies.length + 1,
      ...movieData,
    });
  }
}
