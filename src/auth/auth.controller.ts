import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('authenticate')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  async authenticate(
    @Body() credentials: { username: string; password: string },
  ) {
    const token = await this.authService.validateUser(
      credentials.username,
      credentials.password,
    );
    return { token };
  }
}
