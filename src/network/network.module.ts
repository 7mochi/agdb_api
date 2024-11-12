import { Module } from '@nestjs/common';
import { NetworkController } from './network.controller';

@Module({
  controllers: [NetworkController],
})
export class NetworkModule {}
