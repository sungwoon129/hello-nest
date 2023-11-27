import { Module } from '@nestjs/common';
import { MoviesModule } from './movies/movies.module';
import { AppController } from './app.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Movie } from './movies/entity/movie.entity';

@Module({
  imports: [
    MoviesModule,
    ConfigModule.forRoot({
      envFilePath: `.env.${process.env.NODE_ENV}`,
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      username: process.env.DB_ID,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [Movie],
      synchronize: true,
      logging: true,
    }),
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
