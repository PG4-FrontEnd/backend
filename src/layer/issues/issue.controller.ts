// src/layer/issues/issue.controller.ts
// 이슈 관련 HTTP 요청을 처리하는 컨트롤러
// 이슈의 생성, 조회, 수정, 삭제 등의 엔드포인트를 정의합니다.
import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { IssueService } from './issue.service';
import { CreateIssueDto } from './dto_i/create-issue.dto';
import { UpdateIssueDto } from './dto_i/update-issue.dto';
import { AuthGuard } from '../../common/guards/auth.guard';

@Controller('projects/:projectId/issues')
@UseGuards(AuthGuard) // 모든 이슈 관련 엔드포인트에 인증 필요
export class IssueController {
  constructor(private readonly issueService: IssueService) {}

  // 프로젝트의 모든 이슈 조회
  // GET /projects/:projectId/issues
  @Get()
  async findAll(@Param('projectId') projectId: string) {
    return this.issueService.findAllIssues(+projectId);
  }

  // 특정 이슈 상세 조회
  // GET /projects/:projectId/issues/:issueId
  @Get(':issueId')
  async findOne(
    @Param('projectId') projectId: string,
    @Param('issueId') issueId: string
  ) {
    return this.issueService.findOneIssue(+projectId, +issueId);
  }

  // 새로운 이슈 생성
  // POST /projects/:projectId/issues
  @Post()
  async create(
    @Param('projectId') projectId: string,
    @Body() createIssueDto: CreateIssueDto,
    @Request() req
  ) {
    return this.issueService.createIssue(+projectId, createIssueDto, req.user.id);
  }

  // 이슈 정보 수정
  // PUT /projects/:projectId/issues/:issueId
  @Put(':issueId')
  async update(
    @Param('projectId') projectId: string,
    @Param('issueId') issueId: string,
    @Body() updateIssueDto: UpdateIssueDto,
    @Request() req
  ) {
    return this.issueService.updateIssue(+projectId, +issueId, updateIssueDto, req.user.id);
  }

  // 이슈 순서 변경
  // PUT /projects/:projectId/issues/:issueId/order
  @Put(':issueId/order')
  async updateOrder(
    @Param('projectId') projectId: string,
    @Param('issueId') issueId: string,
    @Body() orderData: { tagId: number; order: number },
    @Request() req
  ) {
    return this.issueService.updateIssueOrder(+projectId, +issueId, orderData, req.user.id);
  }
}