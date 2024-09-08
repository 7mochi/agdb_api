import { Module } from '@nestjs/common';
import { ServersController } from './servers.controller';
import { ServersService } from './servers.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Server } from './server.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Server])],
  providers: [ServersService],
  exports: [ServersService],
  controllers: [ServersController],
})
export class ServersModule {}
