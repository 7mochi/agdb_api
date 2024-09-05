import { ApiProperty } from '@nestjs/swagger';
import { History } from 'src/histories/history.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Player {
  @PrimaryGeneratedColumn()
  @ApiProperty({
    example: 1,
    description: 'ID of the player',
  })
  id: number;

  @Column()
  @ApiProperty({
    example: 'STEAM_0:0:123456',
    description: 'SteamID of the player',
  })
  steamID: string;

  @Column({ default: false })
  @ApiProperty({
    example: false,
    description: 'Is the player banned',
  })
  isBanned: boolean;

  @Column({ type: String, nullable: true })
  @ApiProperty({
    example: 'Cheating',
    description: 'Reason for the ban',
  })
  banReason: string | null;

  @OneToMany(() => History, (history) => history.player)
  @ApiProperty({
    type: () => History,
    description: 'Player history',
  })
  histories: History[];
}
