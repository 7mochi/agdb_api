import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseModule } from '../database/database.module'; // Ajusta la ruta según sea necesario
import { PlayersService } from './players.service';
import { DataSource, EntityNotFoundError, Repository } from 'typeorm';
import { Player } from './player.entity';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { History } from '../histories/history.entity';
import { CreatePlayerDto } from './dto/create-player.dto';
import { InvalidSteamIDError } from './exceptions/invalid-steam-id.error';

describe('UserService', () => {
  let service: PlayersService;
  let playerRepository: Repository<Player>;
  let historyRepository: Repository<History>;
  let dataSource: DataSource;

  const player = {
    id: 1,
    steamID: 'STEAM_0:0:72769420',
    isBanned: false,
    banReason: null,
  } as Player;

  const anotherPlayer = {
    id: 2,
    steamID: 'STEAM_0:0:1313666',
    isBanned: false,
    banReason: null,
  } as Player;

  const multiAccountPlayer = {
    id: 3,
    steamID: 'STEAM_0:0:72759',
    isBanned: false,
    banReason: null,
  } as Player;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        DatabaseModule,
        HttpModule,
        TypeOrmModule.forFeature([Player, History]),
      ],
      providers: [PlayersService],
    }).compile();

    service = module.get<PlayersService>(PlayersService);
    playerRepository = module.get<Repository<Player>>(
      getRepositoryToken(Player),
    );
    historyRepository = module.get<Repository<History>>(
      getRepositoryToken(History),
    );
    dataSource = module.get<DataSource>(DataSource);
  });

  afterAll(async () => {
    await historyRepository.delete({});
    await playerRepository.delete({});
    await dataSource.destroy();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should register a new player', async () => {
      const dto = {
        steamID: 'STEAM_0:0:72769420',
        nickname: 'Test user',
        ip: '7.2.7.0',
      } as CreatePlayerDto;

      const result = await service.register(dto);

      expect(player).toBeDefined();
      expect(result).toEqual(player);
      expect(result).toBeInstanceOf(Player);
    });

    it('should register another new player', async () => {
      const dto = {
        steamID: 'STEAM_0:0:1313666',
        nickname: 'Another test user',
        ip: '1.3.1.3',
      } as CreatePlayerDto;

      const result = await service.register(dto);

      expect(anotherPlayer).toBeDefined();
      expect(result).toEqual(anotherPlayer);
      expect(result).toBeInstanceOf(Player);
    });

    it('should register an existing player but with another nickname', async () => {
      const dto = {
        steamID: 'STEAM_0:0:72769420',
        nickname: 'Test user 2',
        ip: '7.2.7.0',
      } as CreatePlayerDto;

      const result = await service.register(dto);

      expect(player).toBeDefined();
      expect(result).toEqual(player);
      expect(result).toBeInstanceOf(Player);
    });

    it('should register an existing player with the same IP but with another SteamID and nickname', async () => {
      const dto = {
        steamID: 'STEAM_0:0:72759',
        nickname: 'Another test user 2',
        ip: '7.2.7.0',
      } as CreatePlayerDto;

      const result = await service.register(dto);

      expect(multiAccountPlayer).toBeDefined();
      expect(result).toEqual(multiAccountPlayer);
      expect(result).toBeInstanceOf(Player);
    });
  });

  describe('getPlayerBySteamID', () => {
    it('should return a player by SteamID', async () => {
      const result = await service.getPlayerBySteamID('STEAM_0:0:72769420');

      expect(result).toBeDefined();
      expect(result.steamName).toBeDefined();
      expect(result.steamID).toEqual(player.steamID);
      expect(result.steamUrl).toBeDefined();
      if (result.country !== undefined) {
        expect(result.country).toBeDefined();
      }
      expect(result.relatedSteamIDs).toBeInstanceOf(Array);
      expect(result.relatedSteamIDs.length).toEqual(1);
      expect(result.avatar).toBeDefined();
      expect(result.creationTime).toBeGreaterThan(0);
      if (result.creationTime !== undefined) {
        expect(result.creationTime).toBeGreaterThan(0);
      }
      if (result.latestActivity !== undefined) {
        expect(result.latestActivity).toBeGreaterThan(0);
      }
      expect(typeof result.isBanned).toBe('boolean');
      if (result.banReason !== null) {
        expect(result.banReason).toBeDefined();
      } else {
        expect(result.banReason).toBeNull();
      }
      expect(result.nicknames).toBeInstanceOf(Array);
      expect(result.nicknames.length).toEqual(3);
    });

    it('should throw an InvalidSteamIDError for an invalid SteamID', async () => {
      const invalidSteamID = 'INVALID_STEAM_ID';

      await expect(service.getPlayerBySteamID(invalidSteamID)).rejects.toThrow(
        InvalidSteamIDError,
      );
    });

    it('should throw a EntityNotFoundError for a non-existing player', async () => {
      const nonExistingSteamID = 'STEAM_0:0:66699969';

      await expect(
        service.getPlayerBySteamID(nonExistingSteamID),
      ).rejects.toThrow(EntityNotFoundError);
    });
  });

  describe('getAllPlayers', () => {
    it('should return all players', async () => {
      const users = await service.getAllPlayers();

      const result = [player, anotherPlayer, multiAccountPlayer];

      expect(users).toBeDefined();
      expect(users).toEqual(result);
      expect(users).toBeInstanceOf(Array);
    });
  });

  describe('updatePlayerBanStatus', () => {
    it('should update the ban status of a player with a ban and a reason', async () => {
      const result = await service.updatePlayerBanStatus(
        'STEAM_0:0:72769420',
        true,
        {
          reason: 'Test ban reason',
        },
      );

      expect(result).toBeDefined();
      expect(result.steamID).toBe('STEAM_0:0:72769420');
      expect(result.message).toEqual(
        'The player and all their related accounts have been banned.',
      );
    });

    it('should check if the player has been banned', async () => {
      const result = await service.getPlayerBySteamID('STEAM_0:0:72769420');

      expect(result).toBeDefined();
      expect(result.isBanned).toBe(true);
      expect(result.banReason).toBe('Test ban reason');
    });

    it('should update the ban status of a player with a unban', async () => {
      const result = await service.updatePlayerBanStatus(
        'STEAM_0:0:72769420',
        false,
      );

      expect(result).toBeDefined();
      expect(result.steamID).toBe('STEAM_0:0:72769420');
      expect(result.message).toEqual(
        'The player and all their related accounts have been unbanned.',
      );
    });

    it('should check if the player has been unbanned', async () => {
      const result = await service.getPlayerBySteamID('STEAM_0:0:72769420');

      expect(result).toBeDefined();
      expect(result.isBanned).toBe(false);
      expect(result.banReason).toBeNull();
    });

    it('should throw an InvalidSteamIDError for an invalid SteamID', async () => {
      const invalidSteamID = 'INVALID_STEAM_ID';

      await expect(
        service.updatePlayerBanStatus(invalidSteamID, false),
      ).rejects.toThrow(InvalidSteamIDError);
    });

    it('should throw a EntityNotFoundError for a non-existing player', async () => {
      const nonExistingSteamID = 'STEAM_0:0:66699969';

      await expect(
        service.updatePlayerBanStatus(nonExistingSteamID, false),
      ).rejects.toThrow(EntityNotFoundError);
    });
  });
});
