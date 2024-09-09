import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Auth } from './auth.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Auth)
    private readonly authRepository: Repository<Auth>,
  ) {}

  async authenticate(serverIPPort: string, apiKey: string): Promise<boolean> {
    const auth = await this.authRepository.findOneBy({
      serverIPPort: serverIPPort,
      apiKey: apiKey,
    });

    return auth !== null;
  }

  async register(serverIPPort: string, apiKey: string): Promise<Auth> {
    return await this.authRepository.save({
      serverIPPort: serverIPPort,
      apiKey: apiKey,
    });
  }
}
