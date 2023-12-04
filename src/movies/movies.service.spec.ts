import { Test, TestingModule } from '@nestjs/testing';
import { MoviesService } from './movies.service';
import { NotFoundException } from '@nestjs/common';
// Jest는 프로젝트 내부파일을 참조할 때 상대경로를 사용하기때문에 import 경로를 상대경로로 작성해야함. import한 파일의 내부에서도 프로젝트 내 파일 참조시 상대경로로 작성해야함
import { Movie } from './entity/movie.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateMovieDto } from './dto/create-movie.dto';
import { plainToInstance } from 'class-transformer';

const mockMovieRepository = () => ({
  findOne: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  createQueryBuilder: jest.fn().mockReturnValue({
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getOne: jest.fn(),
  }),
});

class MockQueryRunner {
  manager = {
    save: jest.fn().mockImplementation((movie: Movie) => {
      return Promise.resolve({ ...movie, id: 1 });
    }),
  };
  connect() {}
  startTransaction() {}
  commitTransaction() {}
  rollbackTransaction() {}
  release() {}
}

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('MoviesService', () => {
  let service: MoviesService;
  let repository: MockRepository<Movie>;

  /**
   * 여기서 MoviesModule 클래스를 import 할 경우 MoviesRepository의 DataSource에 의존성을 주입할 수 없다는 오류가 나온다.
   * 아마 DataSource 설정이 MoviesModule과 테스트환경에서 충돌이 발생해 나타나는 오류로 추측된다.
   */
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MoviesService,
        { provide: getRepositoryToken(Movie), useValue: mockMovieRepository() },
        {
          provide: DataSource,
          useValue: {
            createQueryRunner: jest.fn(() => new MockQueryRunner()),
            manager: {
              transaction: jest.fn((cb) => cb(new MockQueryRunner())),
            },
          },
        },
      ],
    }).compile();

    service = module.get<MoviesService>(MoviesService);
    repository = module.get<MockRepository<Movie>>(getRepositoryToken(Movie));
  });

  describe('getAll', () => {
    it('should return an array of movies', async () => {
      const mockMovies = [];
      repository.find.mockResolvedValue(mockMovies);

      const result = await service.getAll();

      expect(await service.getAll()).toEqual(result);
    });
  });

  describe('getOne', () => {
    beforeEach(async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue({
        id: 1,
        title: 'Test Movie',
        year: 2023,
        genres: ['action'],
        createdAt: new Date(),
        deletedAt: null,
        updatedAt: new Date(),
        theaters: [],
      });
      await service.getOne(1);
    });
    it('should return a movie with the given ID', async () => {
      expect(repository.findOne).toHaveBeenCalledTimes(1);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: [`theaters`, `theaters.theater`],
      });
    });

    it('should throw NotFoundException if movie with given ID is not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(undefined);

      try {
        await service.getOne(999);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe(`Movie with ID 999 not found.`);
      }
    });
  });

  describe(`deleteOne`, () => {
    it(`deletes a moive`, async () => {
      const result: Movie = {
        id: 1,
        title: 'Test Movie',
        year: 2023,
        genres: ['action'],
        createdAt: new Date(),
        deletedAt: null,
        updatedAt: new Date(),
        theaters: [],
      };
      jest.spyOn(repository, 'findOne').mockResolvedValue(result);
      jest.spyOn(repository, 'delete').mockResolvedValue(undefined);
      await service.deleteOne(result.id);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: result.id },
        relations: [`theaters`, `theaters.theater`],
      });

      expect(repository.delete).toHaveBeenCalledWith(result.id);
      expect(repository.delete).toHaveBeenCalledTimes(1);
    });
    it(`should return a 404`, async () => {
      try {
        await service.deleteOne(999);
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
        expect(e.message).toEqual(`Movie with ID 999 not found.`);
      }
    });
  });

  describe(`create`, () => {
    it(`should create a moive`, async () => {
      const instance: CreateMovieDto = new CreateMovieDto();
      const data = {
        title: `Test Movie`,
        year: 2023,
        genres: [`test`],
      };
      Object.assign(instance, data);

      await service.create(instance);

      expect(repository.save).toHaveBeenCalledTimes(1);
      expect(repository.save).toHaveBeenCalledWith(instance);
    });
  });

  describe(`update`, () => {
    it(`should update a moive`, async () => {
      const result: Movie = {
        id: 1,
        title: 'Test Movie',
        year: 2023,
        genres: ['action'],
        theaters: [],
        createdAt: new Date(),
        deletedAt: null,
        updatedAt: new Date(),
      };
      jest.spyOn(repository, 'findOne').mockResolvedValue(result);

      await service.update(1, { title: 'Updated Test' });

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: result.id },
        relations: [`theaters`, `theaters.theater`],
      });

      expect(repository.update).toHaveBeenCalledTimes(1);
      expect(repository.update).toHaveBeenCalledWith(result.id, {
        title: 'Updated Test',
      });
    });

    it(`should throw a NotFoundException`, async () => {
      try {
        await service.update(999, { title: 'Updated Test' });
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
        expect(e.message).toEqual(`Movie with ID 999 not found.`);
      }
    });
  });

  it('should create many movies with QueryRunner', async () => {
    const movieList: CreateMovieDto[] = plainToInstance(CreateMovieDto, [
      { title: 'Movie 1', year: 2022, genres: ['Action'] },
      { title: 'Movie 2', year: 2023, genres: ['Drama'] },
    ]);

    const result = await service.createManyByQueryRunner(movieList);

    expect(result).toEqual([1, 1]);
    expect(result).toHaveLength(2);
    expect(result).toContain(1);
    expect(repository.save).toHaveBeenCalledTimes(1);
  });
});
