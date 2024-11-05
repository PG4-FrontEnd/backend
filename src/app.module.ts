import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { LoginGuard } from './auth/auth.guard';
import { UsersModule } from './layer/users/user.module';
import { ProjectModule } from './layer/projects/project.module';
import { IssueModule } from './layer/issues/issue.module';
import { MemberModule } from './layer/members/member.module';
import { DatabaseModule } from './config/database/mariadb.module';
import { LoginModule } from './login/login.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    // 환경변수 설정 (.env 파일 사용)
    ConfigModule.forRoot({
      envFilePath: `src/.env`,
      isGlobal: true
    }),
    // JWT 설정
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: '5h'  // Access Token 유효기간 5시간
        },
      }),
      global: true
    }),
    // 데이터베이스 및 기능 모듈
    DatabaseModule,
    UsersModule,
    ProjectModule,
    IssueModule,
    MemberModule,
    LoginModule,
    AuthModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    LoginGuard, // AuthGuard는 providers에 포함되어야 합니다
  ],
})
export class AppModule {}