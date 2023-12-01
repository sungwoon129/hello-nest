import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { MoviesService } from './movies.service';
import { Movie } from './entity/movie.entity';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';

@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Get()
  getAll(): Promise<Movie[]> {
    return this.moviesService.getAll();
  }
  @Get(':id')
  getOne(@Param(`id`) movieId: number): Promise<Movie> {
    return this.moviesService.getOne(movieId);
  }

  @Post()
  create(@Body() movieData: CreateMovieDto): Promise<Movie> {
    return this.moviesService.create(movieData);
  }

  @Delete(`:id`)
  remove(@Param(`id`) movieId: number): Promise<void> {
    return this.moviesService.deleteOne(movieId);
  }

  @Patch(`:id`)
  patch(
    @Param(`id`) movieId: number,
    @Body() updateData: UpdateMovieDto,
  ): void {
    this.moviesService.update(movieId, updateData);
  }
}
