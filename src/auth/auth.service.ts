import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../layer/users/user.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../layer/users/user.dto';
import { User } from '../layer/users/user.entity';

interface TokenPayload {
  id: number;
  email: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(createUserDto: CreateUserDto): Promise<Omit<User, 'password'>> {
    const existingUser = await this.userService.findUser(createUserDto.email)
      .catch(() => null);

    if (existingUser) {
      throw new UnauthorizedException('이미 가입된 이메일입니다.');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const newUser = await this.userService.createUser({
      email: createUserDto.email,
      username: createUserDto.username,
      password: hashedPassword,
      created_at: new Date()
    } as User);

    const { password, ...result } = newUser;
    return result;
  }

  async login(email: string, password: string) {
    const user = await this.userService.findUser(email);

    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!user || !isPasswordValid) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 잘못되었습니다.');
    }

    const payload: TokenPayload = { 
      id: user.id, 
      email: user.email 
    };

    const accessToken = await this.generateAccessToken(payload);
    const refreshToken = await this.generateRefreshToken(payload);

    await this.userService.updateUser(user.email, { refreshToken });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username
      }
    };
  }

  async refreshAccessToken(refreshToken: string): Promise<string> {
    const payload = await this.verifyRefreshToken(refreshToken);
    const user = await this.userService.findUser(payload.email);
    
    if (!user || user.refreshToken !== refreshToken) {
      throw new UnauthorizedException('유효하지 않은 refresh token입니다.');
    }

    return this.generateAccessToken({
      id: user.id,
      email: user.email
    });
  }

  private async generateAccessToken(payload: TokenPayload): Promise<string> {
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: '5h'
    });
  }

  private async generateRefreshToken(payload: TokenPayload): Promise<string> {
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: '28d'
    });
  }

  private async verifyRefreshToken(token: string): Promise<TokenPayload> {
    return this.jwtService.verify(token, {
      secret: this.configService.get<string>('JWT_SECRET')
    });
  }
}