import { Theater } from 'src/theaters/entity/theaters.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  DeleteDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
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

  @ManyToMany(() => Theater, { cascade: true })
  @JoinTable({
    name: 'movie_theater',
    joinColumn: { name: 'movie_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'theater_id', referencedColumnName: 'id' },
  })
  theaters: Theater[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
