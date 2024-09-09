import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { PlayersService } from './players.service';
import { CreatePlayerDto } from './dto/create-player.dto';
import { Player } from './player.entity';
import { AuthGuard } from '../auth/auth.guard';
import { EntityNotFoundError } from 'typeorm';
import { InvalidSteamIDError } from './exceptions/invalid-steam-id.error';
import { MasterKeyGuard } from './master-key.guard';
import { BanPlayerDto } from './dto/ban-player.dto';
import {
  ApiBody,
  ApiHeader,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PlayerResponseDto } from './dto/player-response.dto';

@ApiTags('players')
@Controller('players')
export class PlayersController {
  constructor(private readonly playersService: PlayersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all players' })
  @ApiResponse({
    status: 200,
    description: 'List of all players',
    type: Player,
    example: [
      {
        id: 1,
        steamID: 'STEAM_0:0:123456',
        isBanned: true,
        banReason: 'Cheating',
      },
      {
        id: 2,
        steamID: 'STEAM_0:0:654321',
        isBanned: false,
        banReason: null,
      },
    ],
  })
  async getAllPlayers(): Promise<Player[]> {
    return await this.playersService.getAllPlayers();
  }

  @Get(':steamID')
  @ApiOperation({
    summary: 'Get player by SteamID (SteamID2, SteamID3, SteamID64)',
  })
  @ApiParam({
    name: 'steamID',
    description: 'SteamID of the player',
    examples: {
      SteamID2: { value: 'STEAM_0:0:11101' },
      SteamID3: { value: '[U:1:22202]' },
      SteamID64: { value: '76561197960287930' },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Player found',
    example: [
      {
        steamName: 'JohnDoe',
        steamID: 'STEAM_0:1:12345678',
        steamUrl: 'https://steamcommunity.com/id/johndoe/',
        country: 'US',
        relatedSteamIDs: [
          'STEAM_0:0:87654321',
          'STEAM_0:1:23456789',
          'STEAM_0:0:34567890',
        ],
        avatar: 'https://avatars.steamstatic.com/sample_avatar.jpg',
        creationTime: 1615000000,
        latestActivity: 1630000000,
        isBanned: false,
        banReason: null,
        nicknames: [
          'Gamer123',
          'NoobMaster',
          'ProPlayer',
          'CoolDude',
          'MisterX',
        ],
      },
    ],
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid SteamID',
    example: {
      message: 'Invalid SteamID STEAM_0:0:11101abcd',
      error: 'Bad Request',
      statusCode: 400,
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Player not found',
    example: {
      message: 'Player with SteamID STEAM_0:0:11101 not found',
      error: 'Not Found',
      statusCode: 404,
    },
  })
  async getPlayerBySteamID(
    @Param('steamID') steamID: string,
  ): Promise<PlayerResponseDto | undefined> {
    try {
      return await this.playersService.getPlayerBySteamID(steamID);
    } catch (error) {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException(`Player with SteamID ${steamID} not found`);
      } else if (error instanceof InvalidSteamIDError) {
        throw new BadRequestException(`Invalid SteamID ${steamID}`);
      }
    }
  }

  @Post()
  @ApiOperation({
    summary: `Register a new player, this endpoint is for internal use of the agdb amxx plugin and requires authentication using custom headers. Provide 'ip' and 'token' in the headers.`,
  })
  @ApiHeader({
    name: 'ip',
    description: 'IP address of the server',
    required: true,
  })
  @ApiHeader({
    name: 'token',
    description: 'Secret token to authenticate',
    required: true,
  })
  @ApiBody({ type: CreatePlayerDto })
  @ApiResponse({
    status: 201,
    description: 'Player registered',
    type: Player,
    example: {
      id: 3,
      steamID: 'STEAM_0:0:11101',
      isBanned: false,
      banReason: null,
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    example: {
      message: 'Missing IP or token in headers',
      error: 'Unauthorized',
      statusCode: 401,
    },
  })
  @UseGuards(AuthGuard)
  async register(@Body() createUserDto: CreatePlayerDto): Promise<Player> {
    return this.playersService.register(createUserDto);
  }

  @Post('/ban/:steamID')
  @ApiOperation({
    summary:
      'Ban a player by SteamID (SteamID2, SteamID3, SteamID64), this endpoint is for internal use of the agdb bot and requires a master key. Provide the master key in the headers.',
  })
  @ApiHeader({
    name: 'master-key',
    description: 'Secret master key to authenticate',
    required: true,
  })
  @ApiParam({
    name: 'steamID',
    description: 'SteamID of the player',
    examples: {
      SteamID2: { value: 'STEAM_0:0:11101' },
      SteamID3: { value: '[U:1:22202]' },
      SteamID64: { value: '76561197960287930' },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Player banned',
    example: {
      steamID: 'STEAM_0:0:11101',
      message: 'The player and all their related accounts have been banned.',
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    example: {
      message: 'Invalid master key',
      error: 'Unauthorized',
      statusCode: 401,
    },
  })
  @ApiBody({ type: BanPlayerDto })
  @UseGuards(MasterKeyGuard)
  async banPlayer(
    @Param('steamID') steamID: string,
    @Body() banPlayerDto: BanPlayerDto,
  ) {
    try {
      return await this.playersService.updatePlayerBanStatus(
        steamID,
        true,
        banPlayerDto,
      );
    } catch (error) {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException(`Player with SteamID ${steamID} not found`);
      } else if (error instanceof InvalidSteamIDError) {
        throw new BadRequestException(`Invalid SteamID ${steamID}`);
      }
    }
  }

  @Post('/unban/:steamID')
  @ApiOperation({
    summary:
      'Unban a player by SteamID (SteamID2, SteamID3, SteamID64), this endpoint is for internal use of the agdb bot and requires a master key. Provide the master key in the headers.',
  })
  @ApiHeader({
    name: 'master-key',
    description: 'Secret master key to authenticate',
    required: true,
  })
  @ApiParam({
    name: 'steamID',
    description: 'SteamID of the player',
    examples: {
      SteamID2: { value: 'STEAM_0:0:11101' },
      SteamID3: { value: '[U:1:22202]' },
      SteamID64: { value: '76561197960287930' },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Player unbanned',
    example: {
      steamID: 'STEAM_0:0:11101',
      message: 'The player and all their related accounts have been unbanned.',
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    example: {
      message: 'Invalid master key',
      error: 'Unauthorized',
      statusCode: 401,
    },
  })
  @UseGuards(MasterKeyGuard)
  async unbanPlayer(@Param('steamID') steamID: string) {
    try {
      return await this.playersService.updatePlayerBanStatus(steamID, false);
    } catch (error) {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException(`Player with SteamID ${steamID} not found`);
      } else if (error instanceof InvalidSteamIDError) {
        throw new BadRequestException(`Invalid SteamID ${steamID}`);
      }
    }
  }
}
