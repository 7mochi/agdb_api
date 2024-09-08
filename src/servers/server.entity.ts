import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Server {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  ipPort: string;

  @Column({ nullable: true })
  serverName: string;

  @Column({ nullable: true })
  agdbVersion: string;
}
