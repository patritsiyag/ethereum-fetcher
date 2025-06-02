import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';

/**
 * Service responsible for user authentication and JWT token management.
 * Handles user validation, password hashing, and JWT token generation.
 */
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  /**
   * Validates user credentials and generates a JWT token if valid.
   * Uses bcrypt to securely compare hashed passwords.
   * @param username - The username to validate
   * @param password - The plain text password to validate
   * @returns Promise resolving to a JWT token string
   * @throws UnauthorizedException if credentials are invalid
   */
  async validateUser(username: string, password: string): Promise<string> {
    const user = await this.usersRepository.findOne({
      where: { username },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials password');
    }

    const payload = { username: user.username, sub: user.id };
    return this.jwtService.signAsync(payload);
  }

  /**
   * Hashes a password using bcrypt.
   * @param password - The plain text password to hash
   * @returns Promise resolving to the hashed password string
   */
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }
}
