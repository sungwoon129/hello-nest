import { MovieTheater } from 'src/movie-theater/entity/movie-theater.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  DeleteDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

export enum Gener {
  ACTION = 'action',
  ROMANCE = 'romance',
  COMEDY = 'comedy',
  DRAMA = 'drama',
}

@Entity()
export class Movie {
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
