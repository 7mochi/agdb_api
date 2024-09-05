import { ApiProperty } from '@nestjs/swagger';

export class CreatePlayerDto {
  @ApiProperty({
    example: 'STEAM_0:0:123456',
    description: 'SteamID of the player',
  })
  steamID: string;

  @ApiProperty({
    example: 'JohnDoe',
    description: 'Nickname of the player',
  })
  nickname: string;

  @ApiProperty({
    example: '34.45.81.2',
    description: 'IP address of the player',
  })
  ip: string;
}
