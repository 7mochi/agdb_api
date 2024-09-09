import { ApiProperty } from '@nestjs/swagger';
import { Player } from '../players/player.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class History {
  @PrimaryGeneratedColumn()
  @ApiProperty({
    description: 'ID of the history',
  })
  id: number;

  @Column()
  @ApiProperty({
    example: 'nickname',
    description: 'Nickname of the player',
  })
  nickname: string;

  @Column()
  @ApiProperty({
    example: '34.51.203.1',
    description: 'IP address of the player',
  })
  ip: string;

  @ManyToOne(() => Player, (player) => player.histories)
  @ApiProperty({
    type: () => Player,
    description: 'Player',
  })
  player: Player;
}
