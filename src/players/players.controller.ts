import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { PlayersService } from './players.service';
import { CreatePlayerDto } from './dto/create-player.dto';
import { Player } from './player.entity';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('players')
@UseGuards(AuthGuard)
export class PlayersController {
  constructor(private readonly playersService: PlayersService) {}

  @Post()
  create(@Body() createUserDto: CreatePlayerDto): Promise<Player> {
    return this.playersService.register(createUserDto);
  }
}
