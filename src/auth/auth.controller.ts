import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthenticateDto } from './dto/authenticate.dto';
import {
  authenticateApiOperation,
  authenticateApiBody,
  authenticateApiResponse,
  authenticateApiResponse401,
  authenticateApiResponse500,
} from './swagger.docs';

@Controller('authenticate')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @authenticateApiOperation
  @authenticateApiBody
  @authenticateApiResponse
  @authenticateApiResponse401
  @authenticateApiResponse500
  async authenticate(@Body() authenticateDto: AuthenticateDto) {
    try {
      const token = await this.authService.validateUser(
        authenticateDto.username,
        authenticateDto.password,
      );
      return { token };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw error;
    }
  }
}
