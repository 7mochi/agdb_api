import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ServersService } from './servers.service';
import { Server } from './server.entity';

@ApiTags('servers')
@Controller('servers')
export class ServersController {
  constructor(private readonly serversService: ServersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all servers with AGDB installed' })
  @ApiResponse({
    status: 200,
    description: 'List of all servers with AGDB installed',
    example: [
      {
        id: 1,
        ipPort: '34.13.65.53',
        serverName: 'AG Server #1',
        agdbVersion: '1.0.2',
      },
      {
        id: 2,
        ipPort: '24.123.6.9',
        serverName: 'AG Server #2',
        agdbVersion: '1.0.2',
      },
    ],
  })
  async getServersWithAgdb(): Promise<Server[]> {
    return await this.serversService.getServersWithAgdb();
  }
}
