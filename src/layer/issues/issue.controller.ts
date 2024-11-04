import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req, Query, ParseIntPipe, BadRequestException } from '@nestjs/common';
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

  // 배치 업데이트 - 순서를 앞으로 이동
  @Put('batch-update-order')
  async updateBatchOrder(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Body() body: { updates: { issueId: number; tagId : number; order: number }[] },
    @Req() req: RequestWithUser
  ) {
    if (!body || !body.updates || !Array.isArray(body.updates)) {
      throw new BadRequestException('유효하지 않은 요청 형식입니다. "updates" 배열이 필요합니다.');
    }

    for (const update of body.updates) {
      if (!update.issueId || typeof update.issueId !== 'number') {
        throw new BadRequestException(`유효하지 않은 issueId: ${update.issueId}`);
      }
      if (typeof update.order !== 'number') {
        throw new BadRequestException(`유효하지 않은 order 값: ${update.order}`);
      }
    }

    try {
      const result = await this.issueService.updateBatchOrder(
        projectId,
        body.updates,
        req.user.id
      );
      return result;
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException(error.message);
      }
      throw new BadRequestException('알 수 없는 오류가 발생했습니다.');
    }
  }

  // 이슈 검색
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
