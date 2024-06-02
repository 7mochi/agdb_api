import { Injectable } from '@nestjs/common';
import { Player } from './player.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePlayerDto } from './dto/create-player.dto';
import { History } from 'src/histories/history.entity';

@Injectable()
export class PlayersService {
  constructor(
    @InjectRepository(Player)
    private readonly playersRepository: Repository<Player>,
    @InjectRepository(History)
    private readonly historiesRepository: Repository<History>,
  ) {}

  async register(createPlayerDto: CreatePlayerDto): Promise<Player> {
    const existingPlayer = await this.findBySteamID(createPlayerDto.steamID);

    let player = new Player();
    const history = new History();

    if (existingPlayer === null) {
      player.steamID = createPlayerDto.steamID;
      player = await this.playersRepository.save(player);
    } else {
      player = existingPlayer;
    }

    const existingHistory = await this.historiesRepository.findOneBy({
      ip: createPlayerDto.ip,
      nickname: createPlayerDto.nickname,
    });

    if (existingHistory === null) {
      history.nickname = createPlayerDto.nickname;
      history.player = player;
      history.ip = createPlayerDto.ip;
      await this.historiesRepository.save(history);
    }

    return player;
  }

  async findBySteamID(steamID: string): Promise<Player | null> {
    return this.playersRepository.findOneBy({ steamID: steamID });
  }
}
