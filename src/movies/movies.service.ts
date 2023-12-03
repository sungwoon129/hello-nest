import { Injectable, NotFoundException } from '@nestjs/common';
import { Movie } from './entity/movie.entity';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateMovieDto } from './dto/create-movie.dto';
import { plainToInstance } from 'class-transformer';

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


  /**
   * QueryRunner를 사용한 nestjs 트랜잭션 구현. QueryRunner는 dataSource나 Connection에 의존성을 가지고 있어 테스트하기 까다롭긴 하지만, 트랜잭션 전 과정을 개발자가 컨트롤 할 수 있어
   * 공식문서에서 권장하는 방법.
   * @param movieList
   * @returns
   */
  async createManyByQueryRunner(
    movieList: CreateMovieDto[],
  ): Promise<number[]> {
    // 컨트롤러에서 인스턴스화 시켰기 때문에 CreateMovieDto 내부 함수 사용 가능
    movieList.forEach((t) => console.log(t.toEntity()));

    const result = [];
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const entityArr: Movie[] = plainToInstance(Movie, movieList);
      const savePromises: Promise<Movie>[] = entityArr.map((movie: Movie) =>
        queryRunner.manager.save(movie),
      );

      // forEach와 같은 일반 반복문의 경우 비동기 함수의 처리에서 오류가 발생할 수 있으므로 Promise.all 사용 권장
      await Promise.all(savePromises);
      savePromises.forEach((promise) =>
        promise.then((movie) => result.push(movie.id)),
      );

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new Error(
        `여러개의 영화를 등록하는 중에 오류가 발생했습니다. \n ${error.message}`,
      );
    } finally {
      await queryRunner.release();
      return result;
    }
  }

  /**
   * DataSource 또는 EntityManager 사용한 트랜잭션 구현
   */
  public async createManyByEntityManager(
    movieList: CreateMovieDto[],
  ): Promise<number[]> {
    const entityArr: Movie[] = plainToInstance(Movie, movieList);

    try {
      //await this.dataSource.transaction(async (trasactionalEntityManager) => {...}) 도 동일하게 작용
      const result = await this.dataSource.manager.transaction(
        async (trasactionalEntityManager) => {
          const data = await Promise.all(
            entityArr.map((movie) =>
              trasactionalEntityManager.getRepository(Movie).save(movie),
            ),
          );
          return data.map((movie) => movie.id);
        },
      );
      return result;
    } catch (error) {
      throw new Error(
        `여러개의 영화를 등록하는 중에 오류가 발생했습니다. \n ${error.message}`,
      );
    }
  }
}
