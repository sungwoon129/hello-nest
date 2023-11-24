import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { MoviesService } from './movies.service';
import { Movie } from './entity/movie.entity';

@Controller('movies')
export class MoviesController {
  constructor(readonly moviesService: MoviesService) {}

  @Get()
  getAll() {
    return this.moviesService.getAll();
  }

  @Get(`search`)
  search(@Query(`year`) searchingYear: string): Movie[] {
    return this.moviesService.search(searchingYear);
  }

  @Get(':id')
  getOne(@Param(`id`) movieId: string): Movie {
    console.log('test');
    return this.moviesService.getOne(movieId);
  }

  @Post()
  create(@Body() movieData) {
    return this.moviesService.create(movieData);
  }

  @Delete(`:id`)
  remove(@Param(`id`) movieId: string) {
    return this.moviesService.deleteOne(movieId);
  }

  @Patch(`:id`)
  patch(@Param(`id`) movieId: string, @Body() updateData) {
    return this.moviesService.update(movieId, updateData);
  }
}
