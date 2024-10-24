import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { IssueService } from './issue.service';
import { CreateIssueDto, UpdateIssueDto } from './issue.dto';
import { Issue, IssueStatus } from './issue.entity';

@Controller('issues')
export class IssueController {
  constructor(private readonly issueService: IssueService) {}

  @Post('project/:projectId')
  async create(
    @Param('projectId') projectId: string,
    @Body() createIssueDto: CreateIssueDto,
  ): Promise<Issue> {
    return this.issueService.create(createIssueDto, +projectId);
  }

  @Get('project/:projectId')
  async findAll(
    @Param('projectId') projectId: string,
    @Query('status') status: IssueStatus,
  ): Promise<Issue[]> {
    return this.issueService.findAllByStatus(+projectId, status);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Issue> {
    return this.issueService.findOne(+id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateIssueDto: UpdateIssueDto,
  ): Promise<Issue> {
    return this.issueService.update(+id, updateIssueDto);
  }

  @Put('orders')
  async updateOrders(
    @Body() updates: { id: number; status: IssueStatus; order: number }[],
  ): Promise<void> {
    return this.issueService.updateOrders(updates);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.issueService.remove(+id);
  }
}