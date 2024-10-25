// src/common/guards/auth.guard.ts
// 인증을 처리하는 가드
// 모든 보호된 라우트에 대한 인증 로직을 처리합니다.
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  // 요청 컨텍스트를 받아 인증을 수행하는 메서드
  // @param context - 실행 컨텍스트
  // @returns 인증 성공 여부
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization;

    // 토큰이 없는 경우 예외 처리
    if (!token) {
      throw new UnauthorizedException('토큰이 제공되지 않았습니다.');
    }

    try {
      // JWT 토큰 검증
      const payload = await this.jwtService.verify(token.replace('Bearer ', ''));
      // 검증된 사용자 정보를 요청 객체에 추가
      request.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException('유효하지 않은 토큰입니다.');
    }
  }
}