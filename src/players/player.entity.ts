import { History } from 'src/histories/history.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Player {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  steamID: string;

  @Column({ default: false })
  isBanned: boolean;

  @Column({ nullable: true })
  banReason: string;

  @OneToMany(() => History, (history) => history.player)
  histories: History[];
}
