import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './layer/users/user.module';
import { ProjectModule } from './layer/projects/project.module';
import { IssueModule } from './layer/issues/issue.module';
import { GithubModule } from './layer/github/github.module';
import { DatabaseModule } from './config/database/mariadb.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `src/.env`,
      isGlobal: true
    }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    ProjectModule,
    IssueModule,
    GithubModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}