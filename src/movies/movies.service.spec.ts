import { Test, TestingModule } from '@nestjs/testing';
import { MoviesService } from './movies.service';
import { NotFoundException } from '@nestjs/common';
import { Movie } from './entity/movie.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

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
      const mockMovies = [];
      repository.find.mockResolvedValue(mockMovies);

      const result = await service.getAll();

      expect(await service.getAll()).toEqual(result);
    });
  });

  describe('getOne', () => {
    beforeEach(async () => {
      jest.spyOn(repository.createQueryBuilder(), 'getOne').mockResolvedValue({
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
      expect(repository.createQueryBuilder).toHaveBeenCalledTimes(2);
      expect(
        repository.createQueryBuilder().leftJoinAndSelect,
      ).toHaveBeenCalledTimes(2);
      expect(repository.createQueryBuilder().where).toHaveBeenCalledWith(
        'movie.id = :id',
        { id: 1 },
      );
    });

    it('should throw NotFoundException if movie with given ID is not found', async () => {
      jest
        .spyOn(repository.createQueryBuilder(), 'getOne')
        .mockResolvedValue(undefined);

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

      // expect(repository.findOne).toHaveBeenCalledWith({
      //   where: { id: result.id },
      //   relations: [`theaters`, `theaters.theater`],
      // });

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
      //expect((await service.getOne(1)).title).toEqual(movie.title);

      expect(repository.save).toHaveBeenCalledTimes(1);
      expect(repository.save).toHaveBeenCalledWith(movie);
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
      //jest.spyOn(repository, 'findOne').mockResolvedValue(result);
      jest
        .spyOn(repository.createQueryBuilder(), 'getOne')
        .mockResolvedValue(result);

      await service.update(1, { title: 'Updated Test' });

      // expect(repository.findOne).toHaveBeenCalledWith({
      //   where: { id: result.id },
      //   relations: [`theaters`, `theaters.theater`],
      // });

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
