// src/layer/projects/project.controller.ts
// 프로젝트 관련 HTTP 요청을 처리하는 컨트롤러
// 프로젝트의 생성, 조회, 수정, 삭제 등의 엔드포인트를 정의합니다.
import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto_p/create-project.dto';
import { UpdateProjectDto } from './dto_p/update-project.dto';
import { AuthGuard } from '../../common/guards/auth.guard';

@Controller('projects')
@UseGuards(AuthGuard) // 모든 프로젝트 관련 엔드포인트에 인증 필요
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  // 프로젝트 생성
  // POST /projects
  @Post()
  async create(@Body() createProjectDto: CreateProjectDto, @Request() req) {
    const userId = req.user.id;
    return this.projectService.createProject(createProjectDto, userId);
  }

  // 모든 프로젝트 조회
  // GET /projects
  @Get()
  async findAll(@Request() req) {
    const userId = req.user.id;
    return this.projectService.findAllProjects(userId);
  }

  // 프로젝트 검색
  // GET /projects/search?title=검색어&leader=검색어
  @Get('/search')
  async search(
    @Query('title') title: string,
    @Query('leader') leader: string
  ) {
    return this.projectService.searchProjects(title, leader);
  }

  // 프로젝트 수정
  // PUT /projects/:projectId
  @Put(':projectId')
  async update(
    @Param('projectId') projectId: string,
    @Body() updateProjectDto: UpdateProjectDto,
    @Request() req
  ) {
    const userId = req.user.id;
    return this.projectService.updateProject(+projectId, updateProjectDto, userId);
  }

  // 프로젝트 삭제
  // DELETE /projects/:projectId
  @Delete(':projectId')
  async remove(@Param('projectId') projectId: string, @Request() req) {
    const userId = req.user.id;
    return this.projectService.deleteProject(+projectId, userId);
  }
}