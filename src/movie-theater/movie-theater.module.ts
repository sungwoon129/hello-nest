import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MovieTheater } from './entity/movie-theater.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MovieTheater])],
})
export class MovieTheaterModule {}
