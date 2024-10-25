// src/layer/issues/issue.service.ts
// 이슈 관련 비즈니스 로직을 처리하는 서비스
// 데이터베이스 작업과 이슈 관련 로직을 처리합니다.
import { Injectable, NotFoundException } from '@nestjs/common';
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

  // 프로젝트의 모든 이슈 조회
  // @param projectId - 프로젝트 ID
  async findAllIssues(projectId: number): Promise<Issue[]> {
    return await this.issueRepository.find({
      where: { projectId },
      order: { order: 'ASC' }
    });
  }

  // 특정 이슈 조회
  // @param projectId - 프로젝트 ID
  // @param issueId - 이슈 ID
  async findOneIssue(projectId: number, issueId: number): Promise<Issue> {
    const issue = await this.issueRepository.findOne({
      where: { id: issueId, projectId }
    });

    if (!issue) {
      throw new NotFoundException('이슈를 찾을 수 없습니다.');
    }

    return issue;
  }

  // 새로운 이슈 생성
  // @param projectId - 프로젝트 ID
  // @param createIssueDto - 이슈 생성 데이터
  // @param userId - 생성 요청한 사용자 ID
  async createIssue(projectId: number, createIssueDto: CreateIssueDto, userId: number): Promise<Issue> {
    const issue = this.issueRepository.create({
      ...createIssueDto,
      projectId,
    });
    return await this.issueRepository.save(issue);
  }

  // 이슈 정보 수정
  // @param projectId - 프로젝트 ID
  // @param issueId - 이슈 ID
  // @param updateIssueDto - 수정할 이슈 데이터
  // @param userId - 수정 요청한 사용자 ID
  async updateIssue(projectId: number, issueId: number, updateIssueDto: UpdateIssueDto, userId: number): Promise<Issue> {
    const issue = await this.findOneIssue(projectId, issueId);
    Object.assign(issue, updateIssueDto);
    return await this.issueRepository.save(issue);
  }

  // 이슈 순서 변경
  // @param projectId - 프로젝트 ID
  // @param issueId - 이슈 ID
  // @param orderData - 변경할 순서와 태그 정보
  // @param userId - 수정 요청한 사용자 ID
  async updateIssueOrder(
    projectId: number, 
    issueId: number, 
    orderData: { tagId: number; order: number },
    userId: number
  ): Promise<Issue> {
    const issue = await this.findOneIssue(projectId, issueId);
    issue.tagId = orderData.tagId;
    issue.order = orderData.order;
    return await this.issueRepository.save(issue);
  }
}