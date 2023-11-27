import { Test, TestingModule } from '@nestjs/testing';
import { MoviesService } from './movies.service';
import { NotFoundException } from '@nestjs/common';
import { Movie } from './entity/movie.entity';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

describe('MoviesService', () => {
  let service: MoviesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MoviesService],
      imports: [TypeOrmModule.forFeature([Movie])],
    }).compile();

    service = module.get<MoviesService>(MoviesService);
  });

  describe(`getAll`, () => {
    it('should be return Array', async () => {
      const result = await service.getAll();
      expect(result).toBeInstanceOf(Array);
    });
  });

  describe(`getOne`, () => {
    it(`should be return a movie`, async () => {
      const moive = {
        title: `Test Movie`,
        genres: ['test'],
        year: 2000,
      };
      await service.create(moive);

      const movie = await service.getOne(1);
      expect(movie).toBeDefined();
      expect(movie).toEqual(moive);
    });

    it(`should throw 404 error`, async () => {
      try {
        await service.getOne(999);
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
        expect(e.message).toEqual(`Movie with ID 999 not found.`);
      }
    });
  });

  describe(`deleteOne`, () => {
    it(`deletes a moive`, async () => {
      await service.create({
        title: `Test Movie`,
        genres: ['test'],
        year: 2000,
      });
      const beforeDelete = (await service.getAll()).length;
      await service.deleteOne(1);
      const afterDelete = (await service.getAll()).length;

      expect(afterDelete).toBeLessThan(beforeDelete);
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
        year: 2000,
      };

      await service.create(movie);
      expect((await service.getOne(1)).title).toEqual(movie.title);
    });
  });

  describe(`update`, () => {
    it(`should update a moive`, async () => {
      await service.create({
        title: `Test Movie`,
        genres: ['test'],
        year: 2000,
      });
      await service.update(1, { title: 'Updated Test' });
      const movie = await service.getOne(1);
      expect(movie.title).toEqual(`Updated Test`);
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
