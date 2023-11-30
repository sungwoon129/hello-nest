import { Movie } from 'src/movies/entity/movie.entity';
import { Theater } from 'src/theaters/entity/theaters.entity';
import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: `movie_theater` })
export class MovieTheater {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Movie, (movie) => movie.theaters)
  @JoinColumn({ name: `movie_id`, referencedColumnName: `id` })
  movie: Movie;

  @ManyToOne(() => Theater, (theater) => theater.movies)
  @JoinColumn({ name: `theater_id`, referencedColumnName: `id` })
  theater: Theater;
}
