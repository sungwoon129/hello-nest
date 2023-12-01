import { Test, TestingModule } from '@nestjs/testing';
import { MoviesService } from './movies.service';
import { NotFoundException } from '@nestjs/common';
import { Movie } from './entity/movie.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MoviesModule } from './movies.module';
import { Repository } from 'typeorm';

const mockMovieRepository = () => ({
  findOneBy: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});

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
      ],
    }).compile();

    service = module.get<MoviesService>(MoviesService);
    repository = module.get<MockRepository<Movie>>(getRepositoryToken(Movie));
  });

  // TODO: Entity의 변화에 맞게 테스트 코드 수정 필요
  describe('getAll', () => {
    it('should return an array of movies', async () => {
      const result: Movie[] = [
        {
          id: 1,
          title: 'Test Movie',
          year: 2023,
          genres: ['action'],
          createdAt: new Date(),
          deletedAt: null,
          updatedAt: new Date(),
          theaters: [],
        },
      ];
      jest.spyOn(repository, 'find').mockResolvedValue(result);

      expect(await service.getAll()).toEqual(result);
    });
  });

  describe('getOne', () => {
    it('should return a movie with the given ID', async () => {
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

      expect(await service.getOne(1)).toEqual(result);
    });

    it('should throw NotFoundException if movie with given ID is not found', async () => {
      jest.spyOn(repository, 'findOneBy').mockResolvedValue(undefined);

      await expect(service.getOne(1)).rejects.toThrowError(NotFoundException);
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
      jest.spyOn(repository, 'findOneBy').mockResolvedValue(result);
      jest.spyOn(repository, 'delete').mockResolvedValue(undefined);
      await service.deleteOne(result.id);

      expect(repository.findOneBy).toHaveBeenCalledWith({ id: result.id });

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
      const movie = {
        title: `Test Movie`,
        genres: ['test'],
        year: 2023,
      };

      await service.create(movie);
      expect((await service.getOne(1)).title).toEqual(movie.title);
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
      jest.spyOn(repository, 'findOneBy').mockResolvedValue(result);

      await service.update(1, { title: 'Updated Test' });

      expect(repository.findOneBy).toHaveBeenCalledWith({ id: result.id });

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
});
