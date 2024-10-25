// src/layer/projects/project.service.ts
// 프로젝트 관련 비즈니스 로직을 처리하는 서비스
// 데이터베이스 작업과 프로젝트 관련 로직을 처리합니다.
import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './entity_p/project.entity';
import { CreateProjectDto } from './dto_p/create-project.dto';
import { UpdateProjectDto } from './dto_p/update-project.dto';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
  ) {}

  // 새로운 프로젝트 생성
  // @param createProjectDto - 프로젝트 생성 데이터
  // @param userId - 생성 요청한 사용자 ID
  async createProject(createProjectDto: CreateProjectDto, userId: number): Promise<Project> {
    const project = this.projectRepository.create({
      ...createProjectDto,
      leader: userId.toString(), // 프로젝트 생성자가 리더가 됨
    });
    return await this.projectRepository.save(project);
  }

  // 모든 프로젝트 조회
  // @param userId - 조회 요청한 사용자 ID
  async findAllProjects(userId: number): Promise<Project[]> {
    return await this.projectRepository
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.members', 'member')
      .where('member.userId = :userId', { userId })
      .getMany();
  }

  // 프로젝트 검색
  // @param title - 검색할 프로젝트 제목
  // @param leader - 검색할 프로젝트 리더
  async searchProjects(title?: string, leader?: string): Promise<Project[]> {
    const queryBuilder = this.projectRepository.createQueryBuilder('project');
    
    if (title) {
      queryBuilder.andWhere('project.title LIKE :title', { title: `%${title}%` });
    }
    
    if (leader) {
      queryBuilder.andWhere('project.leader LIKE :leader', { leader: `%${leader}%` });
    }
    
    return await queryBuilder.getMany();
  }

  // 프로젝트 수정
  // @param projectId - 프로젝트 ID
  // @param updateProjectDto - 수정할 프로젝트 데이터
  // @param userId - 수정 요청한 사용자 ID
  async updateProject(projectId: number, updateProjectDto: UpdateProjectDto, userId: number): Promise<Project> {
    const project = await this.projectRepository.findOne({
      where: { id: projectId }
    });

    if (!project) {
      throw new NotFoundException('프로젝트를 찾을 수 없습니다.');
    }

    if (project.leader !== userId.toString()) {
      throw new UnauthorizedException('프로젝트 리더만 수정할 수 있습니다.');
    }

    Object.assign(project, updateProjectDto);
    return await this.projectRepository.save(project);
  }

  // 프로젝트 삭제
  // @param projectId - 프로젝트 ID
  // @param userId - 삭제 요청한 사용자 ID
  async deleteProject(projectId: number, userId: number): Promise<void> {
    const project = await this.projectRepository.findOne({
      where: { id: projectId }
    });

    if (!project) {
      throw new NotFoundException('프로젝트를 찾을 수 없습니다.');
    }

    if (project.leader !== userId.toString()) {
      throw new UnauthorizedException('프로젝트 리더만 삭제할 수 있습니다.');
    }

    await this.projectRepository.remove(project);
  }
}