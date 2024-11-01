import { ApiProperty } from '@nestjs/swagger';

export class TokenResponseDto {
  @ApiProperty({
    description: '새로 발급된 액세스 토큰',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  })
  accessToken!: string;
}

export class RefreshTokenDto {
  @ApiProperty({
    description: '리프레시 토큰',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  })
  refreshToken!: string;
}

export class LoginResponse {
  @ApiProperty()
  accessToken!: string;

  @ApiProperty()
  refreshToken!: string;

  @ApiProperty({
    type: 'object',
    properties: {
      id: { type: 'number' },
      email: { type: 'string' },
      username: { type: 'string' }
    }
  })
  user!: {
    id: number;
    email: string;
    username: string;
  };
}

export interface JwtPayload {
  id: number;
  email: string;
  iat?: number;
  exp?: number;
}

export interface JwtUser {
  id: number;
  email: string;
}

// Request에 추가되는 user 객체의 타입을 확장
declare global {
  namespace Express {
    interface Request {
      user?: JwtUser;
    }
  }
}