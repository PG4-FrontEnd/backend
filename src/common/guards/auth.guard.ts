import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService, private configService: ConfigService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization;

    if (!token) {
      throw new UnauthorizedException('토큰이 제공되지 않았습니다.');
    }

    try {
      // JWT 토큰 검증 (내부 서비스용)
      const jwtPayload = await this.jwtService.verifyAsync(token.replace('Bearer ', ''), {
        secret: this.configService.get<string>('JWT_SECRET') // ConfigService로 변경
      });
      
      // 검증된 사용자 정보를 요청 객체에 추가
      request.user = jwtPayload;
      return true;
    } catch (e) {
      throw new UnauthorizedException('유효하지 않은 토큰입니다.');
    }
  }
}
