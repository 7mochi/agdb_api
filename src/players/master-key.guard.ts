import {
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

export class MasterKeyGuard implements CanActivate {
  constructor() {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const masterKey = request.headers['master-key'];

    if (!masterKey) {
      throw new UnauthorizedException('Missing master key in headers');
    }

    if (masterKey !== process.env.AGDB_MASTER_KEY) {
      throw new UnauthorizedException('Invalid master key');
    }

    return true;
  }
}
