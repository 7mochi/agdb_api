import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { PlayersController } from './players.controller';
import { PlayersService } from './players.service';
import { Player } from './player.entity';
import { History } from '../histories/history.entity';
import { DataSource, Repository } from 'typeorm';
import { CreatePlayerDto } from './dto/create-player.dto';
import { DatabaseModule } from '../database/database.module'; // Ajusta la ruta según tu estructura
import { HttpModule } from '@nestjs/axios';
import { AuthModule } from '../auth/auth.module';
import { AuthGuard } from '../auth/auth.guard';
import { AuthService } from '../auth/auth.service';
import {
  BadRequestException,
  ExecutionContext,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Auth } from '../auth/auth.entity';
import { PlayerResponseDto } from './dto/player-response.dto';

describe('PlayersController', () => {
  let controller: PlayersController;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let playersService: PlayersService;
  let authService: AuthService;
  let playerRepository: Repository<Player>;
  let historyRepository: Repository<History>;
  let authRepository: Repository<Auth>;
  let dataSource: DataSource;
  let authGuard: AuthGuard;

  const auth = {
    serverIPPort: '127.0.0.1',
    apiKey: 'valid-token',
    id: 1,
  } as Auth;

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
        AuthModule,
        TypeOrmModule.forFeature([Player, History]),
      ],
      controllers: [PlayersController],
      providers: [PlayersService],
    }).compile();

    controller = module.get<PlayersController>(PlayersController);
    playerRepository = module.get<Repository<Player>>(
      getRepositoryToken(Player),
    );
    historyRepository = module.get<Repository<History>>(
      getRepositoryToken(History),
    );
    authRepository = module.get<Repository<Auth>>(getRepositoryToken(Auth));
    playersService = module.get<PlayersService>(PlayersService);
    authService = module.get<AuthService>(AuthService);
    dataSource = module.get<DataSource>(DataSource);
    authGuard = new AuthGuard(authService);
  });

  afterAll(async () => {
    await historyRepository.delete({});
    await playerRepository.delete({});
    await authRepository.delete({});
    await dataSource.destroy();
  });

  describe('check AuthGuard', () => {
    describe('canActivate', () => {
      it('should register a new auth', async () => {
        const result = await authService.register('127.0.0.1', 'valid-token');

        expect(result).toBeDefined();
        expect(result).toEqual(auth);
      });

      it('should return true if the user is authenticated', async () => {
        const request: Request = {
          headers: {
            ip: '127.0.0.1',
            token: 'valid-token',
          },
        } as any;

        const context: ExecutionContext = {
          switchToHttp: () => ({
            getRequest: () => request,
          }),
        } as any;

        const canActivate = await authGuard.canActivate(context);

        expect(canActivate).toBe(true);
      });

      it('should throw an UnauthorizedException if the user is not authenticated', async () => {
        const request: Request = {
          headers: {
            ip: '127.0.0.1',
            token: 'invalid-token',
          },
        } as any;

        const context: ExecutionContext = {
          switchToHttp: () => ({
            getRequest: () => request,
          }),
        } as any;

        await expect(authGuard.canActivate(context)).rejects.toThrow(
          UnauthorizedException,
        );
      });
    });
  });

  describe('register', () => {
    it('should register a new player', async () => {
      const dto: CreatePlayerDto = {
        steamID: 'STEAM_0:0:72769420',
        nickname: 'Test user',
        ip: '7.2.7.0',
      };

      const result = await controller.register(dto);

      expect(result).toBeDefined();
      expect(result).toEqual(player);
      expect(result).toBeInstanceOf(Player);
    });

    it('should register another new player', async () => {
      const dto = {
        steamID: 'STEAM_0:0:1313666',
        nickname: 'Another test user',
        ip: '1.3.1.3',
      } as CreatePlayerDto;

      const result = await controller.register(dto);

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

      const result = await controller.register(dto);

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

      const result = await controller.register(dto);

      expect(multiAccountPlayer).toBeDefined();
      expect(result).toEqual(multiAccountPlayer);
      expect(result).toBeInstanceOf(Player);
    });
  });

  describe('getPlayerBySteamID', () => {
    it('should return a player by SteamID', async () => {
      const result = (await controller.getPlayerBySteamID(
        'STEAM_0:0:72769420',
      )) as PlayerResponseDto;

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

    it('should throw an NotFoundException for an invalid SteamID', async () => {
      const invalidSteamID = 'INVALID_STEAM_ID';

      await expect(
        controller.getPlayerBySteamID(invalidSteamID),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw a BadRequestException for a non-existing player', async () => {
      const nonExistingSteamID = 'STEAM_0:0:66699969';

      await expect(
        controller.getPlayerBySteamID(nonExistingSteamID),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getAllPlayers', () => {
    it('should return all players', async () => {
      const users = await controller.getAllPlayers();

      const result = [player, anotherPlayer, multiAccountPlayer];

      expect(users).toBeDefined();
      expect(users).toEqual(result);
      expect(users).toBeInstanceOf(Array);
    });
  });

  describe('updatePlayerBanStatus', () => {
    it('should update the ban status of a player with a ban and a reason', async () => {
      const result = await controller.banPlayer('STEAM_0:0:72769420', {
        reason: 'Test ban reason',
      });

      expect(result).toBeDefined();
      expect(result.steamID).toBe('STEAM_0:0:72769420');
      expect(result.message).toEqual(
        'The player and all their related accounts have been banned.',
      );
    });

    it('should check if the player has been banned', async () => {
      const result = (await controller.getPlayerBySteamID(
        'STEAM_0:0:72769420',
      )) as PlayerResponseDto;

      expect(result).toBeDefined();
      expect(result.isBanned).toBe(true);
      expect(result.banReason).toBe('Test ban reason');
    });

    it('should update the ban status of a player with a unban', async () => {
      const result = await controller.unbanPlayer('STEAM_0:0:72769420');

      expect(result).toBeDefined();
      expect(result.steamID).toBe('STEAM_0:0:72769420');
      expect(result.message).toEqual(
        'The player and all their related accounts have been unbanned.',
      );
    });

    it('should check if the player has been unbanned', async () => {
      const result = (await controller.getPlayerBySteamID(
        'STEAM_0:0:72769420',
      )) as PlayerResponseDto;

      expect(result).toBeDefined();
      expect(result.isBanned).toBe(false);
      expect(result.banReason).toBeNull();
    });

    it('should throw an BadRequestException for an invalid SteamID', async () => {
      const invalidSteamID = 'INVALID_STEAM_ID';

      await expect(controller.unbanPlayer(invalidSteamID)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw a NotFoundException for a non-existing player', async () => {
      const nonExistingSteamID = 'STEAM_0:0:66699969';

      await expect(controller.unbanPlayer(nonExistingSteamID)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
