import { Module } from '@nestjs/common';
import * as Joi from 'joi';
import { PlayersModule } from './players/players.module';
import { HistoriesModule } from './histories/histories.module';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { ServersModule } from './servers/servers.module';
import { ScheduleModule } from '@nestjs/schedule';
import { NetworkModule } from './network/network.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.number().required(),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_DATABASE: Joi.string().required(),
        DB_SYNCHRONIZE: Joi.boolean().required(),
        STEAM_API_KEY: Joi.string().required(),
      }),
    }),
    DatabaseModule,
    PlayersModule,
    HistoriesModule,
    AuthModule,
    ServersModule,
    NetworkModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
