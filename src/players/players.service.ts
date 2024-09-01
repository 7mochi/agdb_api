import { Injectable } from '@nestjs/common';
import { Player } from './player.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePlayerDto } from './dto/create-player.dto';
import { History } from 'src/histories/history.entity';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ID } from '@node-steam/id';
import { ConfigService } from '@nestjs/config';
import { GetPlayerSummariesDto } from './dto/get-player-summaries.dto';
import { InvalidSteamIDError } from './exceptions/invalid-steam-id.error';
import { GetCountryCodeDto } from './dto/get-countrycode.dto';

@Injectable()
export class PlayersService {
  constructor(
    @InjectRepository(Player)
    private readonly playersRepository: Repository<Player>,
    @InjectRepository(History)
    private readonly historiesRepository: Repository<History>,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async getAllPlayers(): Promise<any[]> {
    const players = await this.playersRepository.find();

    return players.map((player) => ({
      steamID: player.steamID,
      isBanned: player.isBanned,
    }));
  }

  async getPlayerBySteamID(steamID: string): Promise<any> {
    let steamAccount;

    try {
      steamAccount = new ID(steamID);
    } catch (error) {
      throw new InvalidSteamIDError(steamID);
    }

    const steamApiKey = this.configService.get<string>('STEAM_API_KEY');

    const { data: playerData } = await firstValueFrom(
      this.httpService
        .get<{
          response: { players: GetPlayerSummariesDto[] };
        }>(
          `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${steamApiKey}&steamids=${steamAccount.getSteamID64()}`,
        )
        .pipe(),
    );
    const playerSummaries: GetPlayerSummariesDto =
      playerData.response.players[0];

    const player = await this.playersRepository.findOneOrFail({
      where: { steamID: steamAccount.getSteamID2() },
      relations: ['histories'],
    });

    const nicknamesSet = new Set<string>();
    const relatedSteamIDsSet = new Set<string>();
    player.histories.forEach((history) => {
      nicknamesSet.add(history.nickname);
    });

    for (const history of player.histories) {
      const relatedHistories = await this.historiesRepository.find({
        where: { ip: history.ip },
        relations: ['player'],
      });

      relatedHistories.forEach((relatedHistory) => {
        relatedSteamIDsSet.add(relatedHistory.player.steamID);
        nicknamesSet.add(relatedHistory.nickname);
      });
    }

    relatedSteamIDsSet.delete(player.steamID);

    const { data: countryData } = await firstValueFrom(
      this.httpService
        .get<GetCountryCodeDto>(
          `http://ip-api.com/json/${player.histories[0].ip}?fields=countryCode`,
        )
        .pipe(),
    );
    const realCountryCode = countryData.countryCode;

    return {
      steamName: playerSummaries.personaname,
      steamID: player.steamID,
      steamUrl: playerSummaries.profileurl,
      country: realCountryCode,
      relatedSteamIDs: Array.from(relatedSteamIDsSet),
      avatar: playerSummaries.avatarfull,
      creationTime: playerSummaries.timecreated,
      latestActivity: playerSummaries.lastlogoff,
      isBanned: player.isBanned,
      nicknames: Array.from(nicknamesSet),
    };
  }

  async register(createPlayerDto: CreatePlayerDto): Promise<Player> {
    const existingPlayer = await this.playersRepository.findOneBy({
      steamID: createPlayerDto.steamID,
    });

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
}
