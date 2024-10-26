import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectMember } from './entity_m/entity.member';
import { ProjectMemberDto } from './dto_m/member.dto';

@Injectable()
export class MemberService {
  constructor(
    @InjectRepository(ProjectMember)
    private memberRepository: Repository<ProjectMember>,
  ) {}

  // 팀원 추가
  async addMember(projectId: number, userId: number, requesterId: number): Promise<ProjectMember> {
    // 프로젝트 멤버인지 확인
    const requesterMember = await this.memberRepository.findOne({
      where: { projectId, userId: requesterId }
    });

    // 새로운 멤버 생성
    const newMember = this.memberRepository.create({
      projectId,
      userId,
      authorization: 0  // 일반 멤버 권한
    });

    return await this.memberRepository.save(newMember);
  }

  // 팀원 삭제 (팀장만 가능)
  async removeMember(projectId: number, userId: number, requesterId: number): Promise<void> {
    // 요청자가 팀장인지 확인
    const requester = await this.memberRepository.findOne({
      where: { projectId, userId: requesterId }
    });

    if (!requester || requester.authorization !== 1) {
      throw new UnauthorizedException('팀장만 멤버를 삭제할 수 있습니다.');
    }

    // 멤버 삭제
    const result = await this.memberRepository.delete({ projectId, userId });
    if (result.affected === 0) {
      throw new NotFoundException('멤버를 찾을 수 없습니다.');
    }
  }

  // 팀원 목록 조회
  async findAllMembers(projectId: number): Promise<ProjectMember[]> {
    return await this.memberRepository.find({
      where: { projectId },
      relations: ['user'], // user 정보도 함께 가져옴
    });
  }

  // 팀장 여부 확인
  async isLeader(projectId: number, userId: number): Promise<boolean> {
    const member = await this.memberRepository.findOne({
      where: { projectId, userId }
    });
    return member?.authorization === 1;
  }
}
