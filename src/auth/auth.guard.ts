import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { JwtPayload, JwtUser } from '../auth/jwt.dto';

@Injectable()
export class LoginGuard implements CanActivate {
  private readonly logger = new Logger(LoginGuard.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    
    try {
      const token = this.extractAndValidateToken(request);
      const payload = await this.verifyToken(token);
      
      // 사용자 정보를 요청 객체에 추가
      request.user = this.extractUserFromPayload(payload);
      
      return true;
    } catch (error) {
      this.handleAuthError(error);
    }
  }

  private extractAndValidateToken(request: any): string {
    const authHeader = request.headers.authorization;
    
    if (!authHeader) {
      this.logger.warn('Authorization header is missing');
      throw new UnauthorizedException('인증 헤더가 존재하지 않습니다.');
    }

    const token = this.extractTokenFromHeader(authHeader);
    
    if (!token) {
      this.logger.warn('Bearer token is missing from authorization header');
      throw new UnauthorizedException('토큰이 올바른 형식이 아닙니다.');
    }

    return token;
  }

  private async verifyToken(token: string): Promise<JwtPayload> {
    const jwtSecret = this.configService.get<string>('JWT_SECRET');
    
    if (!jwtSecret) {
      this.logger.error('JWT_SECRET is not configured');
      throw new Error('JWT 설정이 올바르지 않습니다.');
    }

    try {
      return await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: jwtSecret,
      });
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        this.logger.warn('Token has expired');
        throw new UnauthorizedException('토큰이 만료되었습니다.');
      }
      if (error instanceof JsonWebTokenError) {
        this.logger.warn('Invalid token');
        throw new UnauthorizedException('유효하지 않은 토큰입니다.');
      }
      throw error;
    }
  }

  private extractUserFromPayload(payload: JwtPayload): JwtUser {
    return {
      id: payload.id,
      email: payload.email,
    };
  }

  private extractTokenFromHeader(authHeader: string): string | undefined {
    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : undefined;
  }

  private handleAuthError(error: unknown): never {
    if (error instanceof UnauthorizedException) {
      throw error;
    }

    this.logger.error('Authentication failed:', error);
    throw new UnauthorizedException('인증에 실패했습니다.');
  }
}