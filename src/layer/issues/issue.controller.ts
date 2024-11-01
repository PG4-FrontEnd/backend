import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req, Query } from '@nestjs/common';
import { IssueService } from './issue.service';
import { CreateIssueDto } from './dto_i/create-issue.dto';
import { UpdateIssueDto } from './dto_i/update-issue.dto';
import { AuthGuard } from '../../auth/auth.guard';

interface RequestWithUser {
  user: {
    id: number;
  };
}

@Controller('projects/:projectId/issues')
@UseGuards(AuthGuard)
export class IssueController {
  constructor(private readonly issueService: IssueService) {}

  // 이슈 검색 엔드포인트 추가
  @Get('search')
  async search(
    @Param('projectId') projectId: number,
    @Query('title') title?: string,
    @Query('manager') manager?: string,
    @Query('tagId') tagId?: string,
    @Query('contents') contents?: string,
  ) {
    return this.issueService.searchIssues(projectId, {
      title,
      manager,
      tagId: tagId ? +tagId : undefined,
      contents,
    });
  }

  // 프로젝트의 모든 이슈 조회
  @Get()
  async findAll(@Param('projectId') projectId: number, @Req() req: RequestWithUser) {
    const userId = req.user.id;
    return this.issueService.findAllIssues(projectId, userId);
  }

  // 특정 이슈 상세 조회
  @Get('/:issueId')
  async findOne(@Param('projectId') projectId: string, @Param('issueId') issueId: string, @Req() req: RequestWithUser) {
    const userId = req.user.id;
    return this.issueService.findOneIssue(+projectId, +issueId, userId);
  }

  // 새로운 이슈 생성
  @Post()
  async create(
    @Param('projectId') projectId: number,
    @Body() createIssueDto: CreateIssueDto,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.id;
    return this.issueService.createIssue(projectId, createIssueDto, userId);
  }

  // 이슈 정보 수정
  @Put('/:issueId')
  async update(
    @Param('projectId') projectId: number,
    @Param('issueId') issueId: number,
    @Body() updateIssueDto: UpdateIssueDto,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.id;
    return this.issueService.updateIssue(projectId, issueId, updateIssueDto, userId);
  }

  // 이슈 순서 변경
  @Put('/:issueId/order')
  async updateOrder(
    @Param('projectId') projectId: string,
    @Param('issueId') issueId: string,
    @Body() orderData: { tagId: number; order: number },
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.id;
    return this.issueService.updateIssueOrder(+projectId, +issueId, orderData, userId);
  }

  // 이슈 삭제
  @Delete('/:issueId')
  async delete(@Param('projectId') projectId: number, @Param('issueId') issueId: number, @Req() req: RequestWithUser) {
    const userId = req.user.id;
    await this.issueService.deleteIssue(projectId, issueId, userId);
    return { message: '이슈가 삭제되었습니다.' };
  }
}
