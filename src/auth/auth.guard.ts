import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const ip = request.headers['ip'];
    const token = request.headers['token'];

    if (!ip || !token) {
      throw new UnauthorizedException('Missing IP or token in headers');
    }

    const isValid = await this.authService.authenticate(ip, token);
    if (!isValid) {
      throw new UnauthorizedException('Invalid IP or token');
    }

    return true;
  }
}
