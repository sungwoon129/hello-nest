import { Module } from '@nestjs/common';
import { MoviesModule } from './movies/movies.module';
import { AppController } from './app.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Movie } from './movies/entity/movie.entity';
import { TheatersModule } from './theaters/theaters.module';
import { Theater } from './theaters/entity/theaters.entity';
import { MovieTheaterModule } from './movie-theater/movie-theater.module';
import { MovieTheater } from './movie-theater/entity/movie-theater.entity';
import config from './config/db-config';

@Module({
  imports: [
    MoviesModule,
    TheatersModule,
    ConfigModule.forRoot({
      envFilePath: `.env.${process.env.NODE_ENV}`,
      isGlobal: true,
      load: [config],
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      username: process.env.DB_ID,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [Movie, Theater, MovieTheater],
      synchronize: true,
      logging: true,
    }),
    MovieTheaterModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
