import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from '../../layer/users/user.entity';
import { Project } from '../../layer/projects/entity_p/project.entity';
import { Issue } from '../../layer/issues/entity_i/issue.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mariadb',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        entities: [User, Project, Issue],
        synchronize: true,
        charset: 'utf8mb4',
        logging: true,
        connectTimeout: 30000,
        timezone: '+09:00',
        cache: {
          duration: 30000
        }
      }),
    }),
  ],
})
export class DatabaseModule {}