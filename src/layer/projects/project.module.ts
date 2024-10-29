import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';
import { Project } from './entity_p/project.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Project]) // Project 엔티티 등록
  ],
  controllers: [ProjectController], 
  providers: [ProjectService], 
  exports: [ProjectService], 
})
export class ProjectModule {}