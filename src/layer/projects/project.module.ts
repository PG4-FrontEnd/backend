// src/layer/projects/project.module.ts
// 프로젝트 관련 기능들을 묶어주는 모듈
// 프로젝트와 관련된 컨트롤러, 서비스, 엔티티를 등록합니다.
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';
import { Project } from './entity_p/project.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Project]) // Project 엔티티 등록
  ],
  controllers: [ProjectController], // 프로젝트 컨트롤러 등록
  providers: [ProjectService], // 프로젝트 서비스 등록
  exports: [ProjectService], // 다른 모듈에서 사용할 수 있도록 서비스 내보내기
})
export class ProjectModule {}