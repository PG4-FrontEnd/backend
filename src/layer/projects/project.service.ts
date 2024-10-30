import { 
  Injectable, 
  NotFoundException, 
  UnauthorizedException, 
  InternalServerErrorException,
  Logger
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Project } from './entity_p/project.entity';
import { ProjectMember } from '../members/entity_m/entity.member';
import { CreateProjectDto } from './dto_p/create-project.dto';
import { UpdateProjectDto } from './dto_p/update-project.dto';

@Injectable()
export class ProjectService {
  private readonly logger = new Logger(ProjectService.name);

  constructor(
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @InjectRepository(ProjectMember)
    private memberRepository: Repository<ProjectMember>,
    private dataSource: DataSource
  ) {}

  async createProject(createProjectDto: CreateProjectDto, userId: number): Promise<Project> {
    const queryRunner = this.dataSource.createQueryRunner();
    
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const project = queryRunner.manager.create(Project, {
        ...createProjectDto,
        leader: userId.toString(),
      });
      const savedProject = await queryRunner.manager.save(Project, project);

      const projectMember = queryRunner.manager.create(ProjectMember, {
        userId,
        projectId: savedProject.id,
        authorization: 1  // 리더 권한
      });
      await queryRunner.manager.save(ProjectMember, projectMember);

      await queryRunner.commitTransaction();
      
      this.logger.log(`Project created successfully with ID: ${savedProject.id}`);
      return savedProject;

    } catch (error: unknown) {
      this.logger.error('Failed to create project:', error);
      await queryRunner.rollbackTransaction();
      
      if (error instanceof Error) {
        throw new InternalServerErrorException(`프로젝트 생성 중 오류가 발생했습니다: ${error.message}`);
      }
      throw new InternalServerErrorException('프로젝트 생성 중 알 수 없는 오류가 발생했습니다.');
    } finally {
      await queryRunner.release();
    }
  }

  async findAllProjects(userId: number): Promise<Project[]> {
    try {
      const projects = await this.projectRepository
        .createQueryBuilder('project')
        .innerJoinAndSelect('projectMembers', 'member')
        .where('member.userId = :userId', { userId })
        .orderBy('project.created_at', 'DESC')
        .getMany();

      this.logger.debug(`Retrieved ${projects.length} projects for user ${userId}`);
      return projects;
    } catch (error: unknown) {
      this.logger.error('Failed to fetch projects:', error);
      if (error instanceof Error) {
        throw new InternalServerErrorException(`프로젝트 조회 중 오류가 발생했습니다: ${error.message}`);
      }
      throw new InternalServerErrorException('프로젝트 조회 중 알 수 없는 오류가 발생했습니다.');
    }
  }

  async searchProjects(title: string | undefined, leader: string | undefined, userId: number): Promise<Project[]> {
    try {
      const queryBuilder = this.projectRepository.createQueryBuilder('project')
        .select([
          'project.id',
          'project.title',
          'project.leader',
          'project.repository',
          'project.createdAt',
          'project.deadline'
        ])
        .innerJoin('project.members', 'member')
        .where('member.userId = :userId', { userId });
  
      
      if (title) {
        queryBuilder.andWhere('project.title LIKE :title', { title: `%${title}%` });
      }
      
      if (leader) {
        queryBuilder.andWhere('project.leader = :leader', { leader });
      }

      queryBuilder.orderBy('project.createdAt', 'DESC');

      // 쿼리와 파라미터 로깅
      const [query, parameters] = queryBuilder.getQueryAndParameters();
      this.logger.debug('Executing search query:', { query, parameters });

      const projects = await queryBuilder.getMany();
      this.logger.debug(`Found ${projects.length} projects matching search criteria`);

      return projects;

    } catch (error: unknown) {
      this.logger.error('Search projects failed:', error);
      if (error instanceof Error) {
        throw new InternalServerErrorException(`프로젝트 검색 중 오류가 발생했습니다: ${error.message}`);
      }
      throw new InternalServerErrorException('프로젝트 검색 중 알 수 없는 오류가 발생했습니다.');
    }
  }

  async updateProject(projectId: number, updateProjectDto: UpdateProjectDto, userId: number): Promise<Project> {
    const queryRunner = this.dataSource.createQueryRunner();
    
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const project = await this.projectRepository.findOne({
        where: { id: projectId }
      });

      if (!project) {
        throw new NotFoundException('프로젝트를 찾을 수 없습니다.');
      }

      const isLeader = await this.isProjectLeader(projectId, userId);
      if (!isLeader) {
        throw new UnauthorizedException('프로젝트 리더만 수정할 수 있습니다.');
      }

      Object.assign(project, updateProjectDto);
      const updatedProject = await queryRunner.manager.save(Project, project);

      await queryRunner.commitTransaction();
      
      this.logger.log(`Project ${projectId} updated successfully`);
      return updatedProject;

    } catch (error: unknown) {
      this.logger.error(`Failed to update project ${projectId}:`, error);
      await queryRunner.rollbackTransaction();

      if (error instanceof NotFoundException || error instanceof UnauthorizedException) {
        throw error;
      }
      
      if (error instanceof Error) {
        throw new InternalServerErrorException(`프로젝트 수정 중 오류가 발생했습니다: ${error.message}`);
      }
      throw new InternalServerErrorException('프로젝트 수정 중 알 수 없는 오류가 발생했습니다.');
    } finally {
      await queryRunner.release();
    }
  }

  async deleteProject(projectId: number, userId: number): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const project = await this.projectRepository.findOne({
        where: { id: projectId }
      });

      if (!project) {
        throw new NotFoundException('프로젝트를 찾을 수 없습니다.');
      }

      const isLeader = await this.isProjectLeader(projectId, userId);
      if (!isLeader) {
        throw new UnauthorizedException('프로젝트 리더만 삭제할 수 있습니다.');
      }

      await queryRunner.manager.remove(Project, project);
      await queryRunner.commitTransaction();
      
      this.logger.log(`Project ${projectId} deleted successfully`);

    } catch (error: unknown) {
      this.logger.error(`Failed to delete project ${projectId}:`, error);
      await queryRunner.rollbackTransaction();

      if (error instanceof NotFoundException || error instanceof UnauthorizedException) {
        throw error;
      }
      
      if (error instanceof Error) {
        throw new InternalServerErrorException(`프로젝트 삭제 중 오류가 발생했습니다: ${error.message}`);
      }
      throw new InternalServerErrorException('프로젝트 삭제 중 알 수 없는 오류가 발생했습니다.');
    } finally {
      await queryRunner.release();
    }
  }

  private async isProjectLeader(projectId: number, userId: number): Promise<boolean> {
    try {
      const membership = await this.memberRepository.findOne({
        where: {
          projectId,
          userId,
          authorization: 1
        }
      });
      return !!membership;
    } catch (error: unknown) {
      this.logger.error('Failed to check project leader status:', error);
      if (error instanceof Error) {
        throw new InternalServerErrorException(`프로젝트 권한 확인 중 오류가 발생했습니다: ${error.message}`);
      }
      throw new InternalServerErrorException('프로젝트 권한 확인 중 알 수 없는 오류가 발생했습니다.');
    }
  }
}