import { Injectable, NotFoundException } from '@nestjs/common';
import { Movie } from './entity/movie.entity';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateMovieDto } from './dto/create-movie.dto';

@Injectable()
export class MoviesService {
  constructor(
    @InjectRepository(Movie)
    private readonly moviesRepository: Repository<Movie>,
  ) {}

  async getAll(): Promise<Movie[]> {
    return await this.moviesRepository.find();
  }

  async getOne(id: number): Promise<Movie> {
    const movie = await this.moviesRepository.findOne({
      where: { id },
      relations: [`theaters`],
    });
    if (!movie) throw new NotFoundException(`Movie with ID ${id} not found.`);

    const moive2 = this.moviesRepository
      .createQueryBuilder('movie')
      .leftJoinAndSelect('movie.theaters', 'theaters')
      .leftJoinAndSelect('theaters.theater', 'theater')
      .where('movie.id = :id', { id })
      .getOne();

    return moive2;
  }

  async update(movieId: number, updateData: UpdateMovieDto): Promise<void> {
    await this.getOne(movieId);
    await this.moviesRepository.update(movieId, updateData);
  }

  async deleteOne(movieId: number): Promise<void> {
    await this.getOne(movieId);
    await this.moviesRepository.delete(movieId);
  }

  async create(movieData: CreateMovieDto): Promise<Movie> {
    return await this.moviesRepository.save(movieData);
  }

  // async createMany(movieList: Movie[]) {
  //   const queryRunner = this.dataSource.createQueryRunner();

  //   await queryRunner.connect();
  //   await queryRunner.startTransaction();
  //   try {
  //     await queryRunner.manager.save(movieList[0]);
  //     await queryRunner.manager.save(movieList[1]);

  //     await queryRunner.commitTransaction();
  //   } catch (err) {
  //     // since we have errors lets rollback the changes we made
  //     await queryRunner.rollbackTransaction();
  //   } finally {
  //     // you need to release a queryRunner which was manually instantiated
  //     await queryRunner.release();
  //   }
  // }
}
