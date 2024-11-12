import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RealIP } from 'nestjs-real-ip';

@ApiTags('network')
@Controller('network')
export class NetworkController {
  constructor() {}

  @Get('ip')
  @ApiOperation({ summary: 'Get the public IP address of the client' })
  @ApiResponse({
    status: 200,
    description: 'Public IP address',
    example: { ip: '34.13.65.53' },
  })
  async getPublicIP(@RealIP() ip: string): Promise<any> {
    return { ip };
  }
}
