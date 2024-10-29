import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from '../../layer/users/user.entity';
import { Project } from '../../layer/projects/entity_p/project.entity';
import { Issue } from '../../layer/issues/entity_i/issue.entity';
import { ProjectMember } from '../../layer/members/entity_m/entity.member';

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
       entities: [User, Project, Issue, ProjectMember],
       synchronize: false,
       logging: configService.get<string>('NODE_ENV') !== 'production', // 개발 환경에서만 로깅

       // 연결 관련 설정
       extra: {
         connectionLimit: 10
       },
       pool: {
         max: 10,
         min: 1,
         idle: 10000
       },

       // 기타 설정
       timezone: '+09:00',
       charset: 'utf8mb4',
       ssl: false,
       
       // 드라이버 설정
       driver: require('mysql2')
     }),
   }),
 ],
})
export class DatabaseModule {}