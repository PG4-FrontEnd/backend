import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ProjectService } from './project.service';
import { CreateProjectDto, UpdateProjectDto } from './project.dto';
import { Project } from './project.entity';

@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  async create(@Body() createProjectDto: CreateProjectDto): Promise<Project> {
    return this.projectService.create(createProjectDto);
  }

  @Get()
  async findAll(@Query('userId') userId: string): Promise<Project[]> {
    return this.projectService.findAll(Number(userId));
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Project> {
    return this.projectService.findOne(+id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
  ): Promise<Project> {
    return this.projectService.update(+id, updateProjectDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.projectService.remove(+id);
  }
}