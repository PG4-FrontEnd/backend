import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Issue } from './entity_i/issue.entity';
import { CreateIssueDto } from './dto_i/create-issue.dto';
import { UpdateIssueDto } from './dto_i/update-issue.dto';

@Injectable()
export class IssueService {
  constructor(
    @InjectRepository(Issue)
    private issueRepository: Repository<Issue>,
  ) {}

  // 이슈 검색 기능 추가
async searchIssues(
  projectId: number, 
  searchParams: { 
    title?: string; 
    manager?: string;
    startDate?: Date;
    tagId?: number;
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

  return await queryBuilder.orderBy('issue.order', 'ASC').getMany();
}
  // 프로젝트의 모든 이슈 조회 (권한 체크 포함)
  async findAllIssues(projectId: number, userId: number): Promise<Issue[]> {
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

    // 변경하려는 순서에 이미 다른 이슈가 있는지 확인
    const existingIssueWithOrder = await this.issueRepository.findOne({
      where: { projectId, order: orderData.order },
    });

    // 다른 이슈가 동일한 순서를 가진 경우, 순서가 겹치지 않도록 조정
    if (existingIssueWithOrder && existingIssueWithOrder.id !== issueId) {
      await this.issueRepository
        .createQueryBuilder()
        .update(Issue)
        .set({ order: () => '`order` + 1' }) // 해당 순서 이후 모든 이슈의 순서를 1씩 증가
        .where('projectId = :projectId', { projectId })
        .andWhere('order >= :newOrder', { newOrder: orderData.order })
        .execute();
    }

    // 선택한 이슈의 태그 ID 및 순서 업데이트 후 저장
    issue.tagId = orderData.tagId;
    issue.order = orderData.order;
    return await this.issueRepository.save(issue);
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

    // 프로젝트 멤버십 체크는 별도의 서비스에서 수행되어야 함
 
    return issue;
  }
}
