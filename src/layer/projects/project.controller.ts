import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  UseGuards, 
  Req, 
  Query,
  ParseIntPipe 
} from '@nestjs/common';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto_p/create-project.dto';
import { UpdateProjectDto } from './dto_p/update-project.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

interface RequestWithUser {
  user: {
    id: number;
  };
}

@ApiTags('projects')
@Controller('projects')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  @ApiOperation({ summary: '프로젝트 생성' })
  async create(
    @Body() createProjectDto: CreateProjectDto, 
    @Req() req: RequestWithUser
  ) {
    return this.projectService.createProject(createProjectDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: '프로젝트 목록 조회' })
  async findAll(@Req() req: RequestWithUser) {
    return this.projectService.findAllProjects(req.user.id);
  }

  @Get('/search')
  @ApiOperation({ summary: '프로젝트 검색' })
  async search(
    @Req() req: RequestWithUser,
    @Query('title') title?: string,
    @Query('leader') leader?: string
  ) {
    return this.projectService.searchProjects(title, leader, req.user.id);
  }

  @Put(':projectId')
  @ApiOperation({ summary: '프로젝트 수정' })
  async update(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Body() updateProjectDto: UpdateProjectDto,
    @Req() req: RequestWithUser
  ) {
    return this.projectService.updateProject(projectId, updateProjectDto, req.user.id);
  }

  @Delete(':projectId')
  @ApiOperation({ summary: '프로젝트 삭제' })
  async remove(
    @Param('projectId', ParseIntPipe) projectId: number, 
    @Req() req: RequestWithUser
  ) {
    this.projectService.deleteProject(projectId, req.user.id);
    return "삭제되었습니다."
  }
}