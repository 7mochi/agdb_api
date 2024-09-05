import { ApiProperty } from '@nestjs/swagger';

export class BanPlayerDto {
  @ApiProperty({
    example: 'Cheating',
    description: 'Reason for the ban',
  })
  reason: string;
}
