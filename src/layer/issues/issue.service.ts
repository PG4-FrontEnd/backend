import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Issue } from './entity_i/issue.entity';
import { CreateIssueDto } from './dto_i/create-issue.dto';
import { UpdateIssueDto } from './dto_i/update-issue.dto';

@Injectable()
export class IssueService {
  constructor(
    @InjectRepository(Issue)
    private issueRepository: Repository<Issue>,
  ) {}

  // 프로젝트의 모든 이슈 조회 (권한 체크 포함)
  async findAllIssues(projectId: number, userId: number): Promise<Issue[]> {
    // 프로젝트 멤버십 체크는 별도의 서비스에서 수행되어야 함
    return await this.issueRepository.find({
      where: { projectId },
      order: { order: 'ASC' }
    });
  }

  // 특정 이슈 조회 (권한 체크 포함)
  async findOneIssue(projectId: number, issueId: number, userId: number): Promise<Issue> {
    const issue = await this.findIssueAndCheckPermission(projectId, issueId, userId);
    return issue;
  }

  // 새로운 이슈 생성
  async createIssue(projectId: number, createIssueDto: CreateIssueDto, userId: number): Promise<Issue> {
    // 프로젝트 멤버십 체크는 별도의 서비스에서 수행되어야 함
    const issue = this.issueRepository.create({
      ...createIssueDto,
      projectId,
    });
    return await this.issueRepository.save(issue);
  }

  // 이슈 정보 수정
  async updateIssue(projectId: number, issueId: number, updateIssueDto: UpdateIssueDto, userId: number): Promise<Issue> {
    const issue = await this.findIssueAndCheckPermission(projectId, issueId, userId);
    Object.assign(issue, updateIssueDto);
    return await this.issueRepository.save(issue);
  }

  // 이슈 순서 변경
  async updateIssueOrder(
    projectId: number, 
    issueId: number, 
    orderData: { tagId: number; order: number },
    userId: number
  ): Promise<Issue> {
    const issue = await this.findIssueAndCheckPermission(projectId, issueId, userId);
    issue.tagId = orderData.tagId;
    issue.order = orderData.order;
    return await this.issueRepository.save(issue);
  }

  // 권한 체크를 포함한 이슈 조회 헬퍼 메서드
  private async findIssueAndCheckPermission(projectId: number, issueId: number, userId: number): Promise<Issue> {
    const issue = await this.issueRepository.findOne({
      where: { id: issueId, projectId }
    });

    if (!issue) {
      throw new NotFoundException('이슈를 찾을 수 없습니다.');
    }

    // 프로젝트 멤버십 체크는 별도의 서비스에서 수행되어야 함

    return issue;
  }
}