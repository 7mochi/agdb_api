import { Player } from 'src/players/player.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class History {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nickname: string;

  @Column()
  ip: string;

  @ManyToOne(() => Player, (player) => player.histories)
  player: Player;
}
