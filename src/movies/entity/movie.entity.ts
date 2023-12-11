import { MovieTheater } from '../../movie-theater/entity/movie-theater.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  DeleteDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

export enum Genre {
  ACTION = 'action',
  ROMANCE = 'romance',
  COMEDY = 'comedy',
  DRAMA = 'drama',
}

@Entity()
export class Movie {
  constructor(title: string, year: number, genres?: string[]) {
    this.title = title;
    this.year = year;
    this.genres = genres;
  }

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  year: number;

  @Column({ type: 'json', nullable: true })
  genres: string[];

  @OneToMany(() => MovieTheater, (movieTheater) => movieTheater.movie)
  theaters: MovieTheater[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
