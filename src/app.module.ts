// src/app.module.ts
// 어플리케이션의 루트 모듈
// 모든 기능 모듈들을 통합하고 전역 설정을 관리합니다.
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AuthGuard } from './common/guards/auth.guard';
import { UsersModule } from './layer/users/user.module';
import { ProjectModule } from './layer/projects/project.module';
import { IssueModule } from './layer/issues/issue.module';
import { DatabaseModule } from './config/database/mariadb.module';

@Module({
  imports: [
    // 환경변수 설정 (.env 파일 사용)
    ConfigModule.forRoot({
      envFilePath: `src/.env`,
      isGlobal: true
    }),
    // 데이터베이스 연결 모듈
    DatabaseModule,
    // 기능별 모듈들
    UsersModule,
    ProjectModule,
    IssueModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    AuthGuard  // AuthGuard는 providers에 포함되어야 합니다
  ],
})
export class AppModule {}