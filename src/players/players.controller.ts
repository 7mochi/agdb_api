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
import { AuthGuard } from 'src/auth/auth.guard';
import { EntityNotFoundError } from 'typeorm';
import { InvalidSteamIDError } from './exceptions/invalid-steam-id.error';
import { MasterKeyGuard } from './master-key.guard';

@Controller('players')
export class PlayersController {
  constructor(private readonly playersService: PlayersService) {}

  @Get()
  async getAllPlayers() {
    return await this.playersService.getAllPlayers();
  }

  @Get(':steamID')
  async getPlayerBySteamID(@Param('steamID') steamID: string) {
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
  @UseGuards(AuthGuard)
  async create(@Body() createUserDto: CreatePlayerDto): Promise<Player> {
    return this.playersService.register(createUserDto);
  }

  @Post('/ban/:steamID')
  @UseGuards(MasterKeyGuard)
  async banPlayer(@Param('steamID') steamID: string) {
    try {
      return await this.playersService.updatePlayerBanStatus(steamID, true);
    } catch (error) {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException(`Player with SteamID ${steamID} not found`);
      } else if (error instanceof InvalidSteamIDError) {
        throw new BadRequestException(`Invalid SteamID ${steamID}`);
      }
    }
  }

  @Post('/unban/:steamID')
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
