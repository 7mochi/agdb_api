import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Server } from './server.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import {
  queryGameServerInfo,
  queryGameServerRules,
  queryMasterServer,
  REGIONS,
} from 'steam-server-query-goldsrc-support';

@Injectable()
export class ServersService {
  private readonly logger = new Logger(ServersService.name);

  constructor(
    @InjectRepository(Server)
    private readonly serverRepository: Repository<Server>,
  ) {}

  async onModuleInit() {
    setTimeout(async () => {
      await this.checkSteamMasterServer();
    }, 0);
  }

  @Cron('0 */15 * * * *', {
    name: 'checkSteamMasterServer',
  })
  async checkSteamMasterServer() {
    this.logger.log('[CRON] Checking steam master server and saving servers');

    const masterServer = await queryMasterServer(
      'hl1master.steampowered.com:27011',
      REGIONS.ALL,
      {
        appid: 70,
        gamedir: 'ag',
        dedicated: 1,
        nand: {
          proxy: 1,
        },
      },
      1000,
    );

    for (const steamServer of masterServer) {
      const existingServer = await this.serverRepository.findOneBy({
        ipPort: steamServer,
      });

      if (existingServer === null) {
        await this.serverRepository.save({
          ipPort: steamServer,
        });
      }
    }

    this.logger.log('[CRON] Servers saved successfully');

    this.updateServersData();
  }

  async updateServersData() {
    this.logger.log(
      '[CRON] Getting servers data from steam and updating servers data',
    );

    const servers = await this.serverRepository.find();

    if (servers.length > 0) {
      const batchSize = 50;
      for (let i = 0; i < servers.length; i += batchSize) {
        const batch = servers.slice(i, i + batchSize);

        const promises = batch.map(async (server) => {
          try {
            this.logger.log(`[CRON] Querying server ${server.ipPort}`);
            const serverInfo = await queryGameServerInfo(
              server.ipPort,
              3,
              2000,
            );
            const serverRules = await queryGameServerRules(
              server.ipPort,
              3,
              2000,
            );

            const agdbVersionCvar = serverRules.rules.find(
              (rule) => rule.name === 'agdb_version',
            );

            if (agdbVersionCvar) {
              server.serverName = serverInfo.name;
              server.agdbVersion = agdbVersionCvar.value;
              await this.serverRepository.save(server);
            } else {
              this.logger.log(
                `[CRON] Server ${server.ipPort} does not have AGDB installed, removing server`,
              );
              await this.serverRepository.remove(server);
            }
          } catch (error) {
            this.logger.log(
              `[CRON] Error querying server ${server.ipPort}, removing server`,
            );
            await this.serverRepository.remove(server);
          }
        });

        await Promise.all(promises);
      }

      this.logger.log('[CRON] Servers data updated successfully');
    }
  }

  async getServersWithAgdb(): Promise<Server[]> {
    return await this.serverRepository.find({
      where: {
        agdbVersion: Not(IsNull()),
      },
    });
  }
}
