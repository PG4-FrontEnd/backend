import { Injectable, NotFoundException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Issue } from './entity_i/issue.entity';
import { CreateIssueDto } from './dto_i/create-issue.dto';
import { UpdateIssueDto } from './dto_i/update-issue.dto';

@Injectable()
export class IssueService {
  constructor(
    @InjectRepository(Issue)
    private issueRepository: Repository<Issue>
  ) {}

  // 이슈 검색
  async searchIssues(
    projectId: number, 
    searchParams: { 
      title?: string; 
      manager?: string;
      tagId?: number;
      contents?: string;
    }
  ): Promise<Issue[]> {
    const queryBuilder = this.issueRepository.createQueryBuilder('issue')
      .where('issue.projectId = :projectId', { projectId });

    if (searchParams.title) {
      queryBuilder.andWhere('issue.title LIKE :title', { title: `%${searchParams.title}%` });
    }

    if (searchParams.manager) {
      queryBuilder.andWhere('issue.manager LIKE :manager', { manager: `%${searchParams.manager}%` });
    }

    if (searchParams.tagId) {
      queryBuilder.andWhere('issue.tagId = :tagId', { tagId: searchParams.tagId });
    }

    if (searchParams.contents) {
      queryBuilder.andWhere('issue.contents LIKE :contents', { contents: `%${searchParams.contents}%` });
    }

    return await queryBuilder.orderBy('issue.order', 'ASC').getMany();
  }

  // 프로젝트의 모든 이슈 조회
  async findAllIssues(projectId: number, userId: number): Promise<Issue[]> {
    return await this.issueRepository.find({
      where: { projectId },
      order: { order: 'ASC' }
    });
  }

  // 특정 이슈 조회
  async findOneIssue(projectId: number, issueId: number, userId: number): Promise<Issue> {
    const issue = await this.findIssueAndCheckPermission(projectId, issueId, userId);
    return issue;
  }

  // 새로운 이슈 생성
  async createIssue(projectId: number, createIssueDto: CreateIssueDto, userId: number): Promise<Issue> {
    const issue = this.issueRepository.create({
      ...createIssueDto,
      projectId,
      userId,
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

    const existingIssueWithOrder = await this.issueRepository.findOne({
      where: { projectId, order: orderData.order },
    });

    if (existingIssueWithOrder && existingIssueWithOrder.id !== issueId) {
      await this.issueRepository
        .createQueryBuilder()
        .update(Issue)
        .set({ order: () => '`order` + 1' })
        .where('projectId = :projectId', { projectId })
        .andWhere('order >= :newOrder', { newOrder: orderData.order })
        .execute();
    }

    issue.tagId = orderData.tagId;
    issue.order = orderData.order;
    return await this.issueRepository.save(issue);
  }

  // 배치 업데이트
  async updateBatchOrder(
    projectId: number,
    updates: { issueId: number; tagId: number; order: number }[],
    userId: number
  ): Promise<Issue[]> {
    const issueIds = updates.map(update => update.issueId);
    const existingIssues = await this.issueRepository.find({
      where: { 
        id: In(issueIds),
        projectId 
      }
    });

    if (existingIssues.length !== updates.length) {
      const foundIds = existingIssues.map(issue => issue.id);
      const missingIds = issueIds.filter(id => !foundIds.includes(id));
      throw new BadRequestException(`일부 이슈를 찾을 수 없습니다: ${missingIds.join(', ')}`);
    }

    const updatedIssues = await Promise.all(
      updates.map(async update => {
        const issue = existingIssues.find(i => i.id === update.issueId);
        if (issue) {
          issue.tagId = update.tagId;
          issue.order = update.order;
          return await this.issueRepository.save(issue);
        }
        return null;
      })
    );

    return updatedIssues.filter((issue): issue is Issue => issue !== null);
  }

  // 이슈 삭제
  async deleteIssue(projectId: number, issueId: number, userId: number): Promise<void> {
    const issue = await this.findIssueAndCheckPermission(projectId, issueId, userId);
    await this.issueRepository.remove(issue);
  }

  // 권한 체크를 포함한 이슈 조회 헬퍼 메서드
  private async findIssueAndCheckPermission(projectId: number, issueId: number, userId: number): Promise<Issue> {
    const issue = await this.issueRepository.findOne({
      where: { id: issueId, projectId }
    });

    if (!issue) {
      throw new NotFoundException('이슈를 찾을 수 없습니다.');
    }

    return issue;
  }
}