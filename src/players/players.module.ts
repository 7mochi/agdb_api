import { Module } from '@nestjs/common';
import { PlayersService } from './players.service';
import { PlayersController } from './players.controller';
import { Player } from './player.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HistoriesModule } from '../histories/histories.module';
import { AuthModule } from '../auth/auth.module';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([Player]),
    HistoriesModule,
    AuthModule,
    ConfigModule,
    HttpModule,
  ],
  providers: [PlayersService],
  exports: [PlayersService],
  controllers: [PlayersController],
})
export class PlayersModule {}
