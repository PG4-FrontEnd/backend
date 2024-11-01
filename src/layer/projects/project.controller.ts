import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req, Query } from '@nestjs/common';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto_p/create-project.dto';
import { UpdateProjectDto } from './dto_p/update-project.dto';
import { LoginGuard } from '../../common/guards/auth.guard';

interface RequestWithUser {
  user: {
    id: number;
  };
}

@Controller('projects')
@UseGuards(LoginGuard)
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  async create(
    @Body() createProjectDto: CreateProjectDto, 
    @Req() req: RequestWithUser
  ) {
    return this.projectService.createProject(createProjectDto, req.user.id);
  }

  @Get()
  async findAll(@Req() req: RequestWithUser) {
    return this.projectService.findAllProjects(req.user.id);
  }

  @Get('/search')
  async search(
    @Query('title') title: string,
    @Query('leader') leader: string,
    @Req() req: RequestWithUser
  ) {
    return this.projectService.searchProjects(title, leader);
  }

  @Put(':projectId')
  async update(
    @Param('projectId') projectId: string,
    @Body() updateProjectDto: UpdateProjectDto,
    @Req() req: RequestWithUser
  ) {
    return this.projectService.updateProject(+projectId, updateProjectDto, req.user.id);
  }

  @Delete(':projectId')
  async remove(
    @Param('projectId') projectId: string, 
    @Req() req: RequestWithUser
  ) {
    return this.projectService.deleteProject(+projectId, req.user.id);
  }
}