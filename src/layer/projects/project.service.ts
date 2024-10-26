import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './entity_p/project.entity';
import { CreateProjectDto } from './dto_p/create-project.dto';
import { UpdateProjectDto } from './dto_p/update-project.dto';
import axios from 'axios';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
  ) {}

  async createProject(createProjectDto: CreateProjectDto, userId: number): Promise<Project> {
    const project = this.projectRepository.create({
      ...createProjectDto,
      leader: userId.toString(),
    });
    return await this.projectRepository.save(project);
  }

  async findAllProjects(userId: number): Promise<Project[]> {
    return await this.projectRepository
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.members', 'member')
      .where('member.userId = :userId', { userId })
      .getMany();
  }

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

  // GitHub PR 조회
  async getProjectPRs(owner: string, repo: string, githubAccessToken: string) {
    try {
      const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/pulls`, {
        headers: {
          'Authorization': `Bearer ${githubAccessToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });
      return response.data;
    } catch (error) {
      throw new UnauthorizedException('GitHub PR 조회에 실패했습니다.');
    }
  }
}