import { Injectable, NotFoundException } from '@nestjs/common';
import { Movie } from './entity/movie.entity';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateMovieDto } from './dto/create-movie.dto';

@Injectable()
export class MoviesService {
  constructor(
    @InjectRepository(Movie)
    private readonly moviesRepository: Repository<Movie>,
    private dataSource: DataSource,
  ) {}

  async getAll(): Promise<Movie[]> {
    return await this.moviesRepository.find();
  }

  async getOne(id: number): Promise<Movie> {
    /**
     * TypeORM findOne을 통해 조회
     * */
    const movie = await this.moviesRepository.findOne({
      where: { id },
      relations: [`theaters`, `theaters.theater`],
    });

    /**
     * 쿼리빌더를 통해 조회.
     */
    // const movie = this.moviesRepository
    //   .createQueryBuilder('movie')
    //   .leftJoinAndSelect('movie.theaters', 'movie_theater')
    //   .leftJoinAndSelect('movie_theater.theater', 'theater')
    //   .where('movie.id = :id', { id })
    //   .getOne();

    if (!movie) throw new NotFoundException(`Movie with ID ${id} not found.`);

    return movie;
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

  async createManyByQueryRunner(movieList: CreateMovieDto[]): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      movieList.forEach(async (dto) => {
        console.log(dto.toEntity());
        await queryRunner.manager.save(dto.toEntity);
      });

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }
}
