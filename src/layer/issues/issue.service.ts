import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Issue, IssueStatus } from './issue.entity';
import { CreateIssueDto, UpdateIssueDto } from './issue.dto';

@Injectable()
export class IssueService {
  constructor(
    @InjectRepository(Issue)
    private issueRepository: Repository<Issue>,
  ) {}

  async create(createIssueDto: CreateIssueDto, projectId: number): Promise<Issue> {
    // 같은 상태의 마지막 순서 찾기
    const lastIssue = await this.issueRepository.findOne({
      where: {
        project: { id: projectId },
        status: createIssueDto.status,
      },
      order: { order: 'DESC' },
    });

    const newOrder = lastIssue ? lastIssue.order + 1 : 0;

    const issue = this.issueRepository.create({
      ...createIssueDto,
      order: newOrder,
      project: { id: projectId },
    });

    return await this.issueRepository.save(issue);
  }

  async findAllByStatus(projectId: number, status: IssueStatus): Promise<Issue[]> {
    return await this.issueRepository.find({
      where: {
        project: { id: projectId },
        status,
      },
      order: { order: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Issue> {
    const issue = await this.issueRepository.findOne({
      where: { id },
      relations: ['project'],
    });
    if (!issue) {
      throw new NotFoundException(`Issue with ID ${id} not found`);
    }
    return issue;
  }

  async update(id: number, updateIssueDto: UpdateIssueDto): Promise<Issue> {
    const issue = await this.findOne(id);

    // 상태가 변경되었을 경우 새로운 순서 계산
    if (updateIssueDto.status && updateIssueDto.status !== issue.status) {
      const lastIssue = await this.issueRepository.findOne({
        where: {
          project: { id: issue.project.id },
          status: updateIssueDto.status,
        },
        order: { order: 'DESC' },
      });

      updateIssueDto.order = lastIssue ? lastIssue.order + 1 : 0;
    }

    Object.assign(issue, updateIssueDto);
    return await this.issueRepository.save(issue);
  }

  async updateOrders(updates: { id: number; status: IssueStatus; order: number }[]): Promise<void> {
    await Promise.all(
      updates.map(async ({ id, status, order }) => {
        const issue = await this.findOne(id);
        issue.status = status;
        issue.order = order;
        await this.issueRepository.save(issue);
      }),
    );
  }

  async remove(id: number): Promise<void> {
    const result = await this.issueRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Issue with ID ${id} not found`);
    }
  }
}
