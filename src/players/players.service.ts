import { Injectable } from '@nestjs/common';
import { Player } from './player.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePlayerDto } from './dto/create-player.dto';
import { History } from '../histories/history.entity';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ID } from '@node-steam/id';
import { ConfigService } from '@nestjs/config';
import { GetPlayerSummariesDto } from './dto/get-player-summaries.dto';
import { InvalidSteamIDError } from './exceptions/invalid-steam-id.error';
import { GetCountryCodeDto } from './dto/get-countrycode.dto';
import { BanPlayerDto } from './dto/ban-player.dto';
import { PlayerResponseDto } from './dto/player-response.dto';

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

  async getAllPlayers(): Promise<Player[]> {
    return await this.playersRepository.find();
  }

  async getPlayerBySteamID(steamID: string): Promise<PlayerResponseDto> {
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
      banReason: player.banReason,
      nicknames: Array.from(nicknamesSet),
    };
  }

  async register(createPlayerDto: CreatePlayerDto): Promise<Player> {
    let wasBannedBefore = false;
    const existingHistoryByIP = await this.historiesRepository.findOneBy({
      ip: createPlayerDto.ip,
    });

    if (existingHistoryByIP !== null) {
      const relatedHistories = await this.historiesRepository.find({
        where: { ip: existingHistoryByIP.ip },
        relations: ['player'],
      });

      relatedHistories.forEach(async (relatedHistory) => {
        if (relatedHistory.player.isBanned) {
          wasBannedBefore = true;
        }
      });
    }

    const existingPlayer = await this.playersRepository.findOneBy({
      steamID: createPlayerDto.steamID,
    });

    let player = new Player();
    const history = new History();

    if (existingPlayer === null) {
      player.steamID = createPlayerDto.steamID;
      player.isBanned = wasBannedBefore;
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

  async updatePlayerBanStatus(
    steamID: string,
    banStatus: boolean,
    banPlayerDto?: BanPlayerDto,
  ): Promise<any> {
    let steamAccount;

    try {
      steamAccount = new ID(steamID);
    } catch (error) {
      throw new InvalidSteamIDError(steamID);
    }

    const player = await this.playersRepository.findOneOrFail({
      where: { steamID: steamAccount.getSteamID2() },
      relations: ['histories'],
    });

    // Actualizamos solo los campos que necesitamos, sin incluir relaciones
    await this.playersRepository.update(player.id, {
      isBanned: banStatus,
      banReason: banPlayerDto?.reason || null,
    });

    // Actualizamos las cuentas relacionadas con la misma IP
    for (const history of player.histories) {
      const relatedHistories = await this.historiesRepository.find({
        where: { ip: history.ip },
        relations: ['player'],
      });

      for (const relatedHistory of relatedHistories) {
        await this.playersRepository.update(relatedHistory.player.id, {
          isBanned: banStatus,
          banReason: banPlayerDto?.reason || null,
        });
      }
    }

    return {
      steamID: player.steamID,
      message: `The player and all their related accounts have been ${banStatus ? 'banned' : 'unbanned'}.`,
    };
  }
}
