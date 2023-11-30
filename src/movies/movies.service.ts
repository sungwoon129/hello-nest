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
    /**
     * @ManyToMany를 사용해서 양방향관계를 구현한 경우 동작. relations는 해당 엔티티에 존재하는 필드만 참조할 수 있다.
    const movie = await this.moviesRepository.findOne({
      where: { id },
      relations: [`theaters`],
    });
    */

    /**
     * @ManyToOne과 @OneToMany를 사용해서 직접 중간테이블을 만든 뒤 쿼리빌더를 통해 조회하는 방법. movie엔티티에는 movie_theater 에 대한 정보만 존재하므로 relations를 사용할 수 없다.
     */
    const movie = this.moviesRepository
      .createQueryBuilder('movie')
      .leftJoinAndSelect('movie.theaters', 'movie_theater')
      .leftJoinAndSelect('movie_theater.theater', 'theater')
      .where('movie.id = :id', { id })
      .getOne();

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
