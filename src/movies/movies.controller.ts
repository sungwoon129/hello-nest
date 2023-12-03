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

  @Post(`/multiple`)
  createMany(@Body() movieList: CreateMovieDto[]): Promise<number[]> {
    // class-transformer의 plainToInstance 함수를 사용하지 않을 경우, 직접 인스턴스를 만들어야 dto 클래스 내부 함수를 사용할 수 있음
    const movieDtoInstances: CreateMovieDto[] = movieList.map((json) => {
      const instance = new CreateMovieDto();
      Object.assign(instance, json);
      return instance;
    });

    //return this.moviesService.createManyByQueryRunner(movieDtoInstances);
    return this.moviesService.createManyByEntityManager(movieDtoInstances);

  }
}
