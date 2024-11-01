import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectMember } from './entity_m/entity.member';
import { User } from '../users/user.entity';
import { Logger } from '@nestjs/common';

@Injectable()
export class MemberService {
  private readonly logger = new Logger(MemberService.name);

  constructor(
    @InjectRepository(ProjectMember)
    private memberRepository: Repository<ProjectMember>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  // 팀원 초대
  async addMember(projectId: number, inviteeEmail: string, requesterId: number): Promise<ProjectMember> {
    // 1. 초대 권한 확인
    const requesterMember = await this.memberRepository.findOne({
      where: { projectId, userId: requesterId }
    });

    if (!requesterMember) {
      throw new UnauthorizedException('프로젝트 멤버만 초대할 수 있습니다.');
    }

    if (requesterMember.authorization !== 1) {
      throw new UnauthorizedException('팀장만 멤버를 초대할 수 있습니다.');
    }

    // 2. 초대할 사용자 찾기
    const invitee = await this.userRepository.findOne({
      where: { email: inviteeEmail }
    });

    if (!invitee) {
      throw new NotFoundException('초대할 사용자를 찾을 수 없습니다.');
    }

    // 3. 이미 멤버인지 확인
    const existingMember = await this.memberRepository.findOne({
      where: { projectId, userId: invitee.id }
    });

    if (existingMember) {
      throw new UnauthorizedException('이미 프로젝트의 멤버입니다.');
    }

    // 4. 새로운 멤버 생성
    const newMember = this.memberRepository.create({
      projectId,
      userId: invitee.id,
      authorization: 0  // 일반 멤버 권한
    });

    try {
      const savedMember = await this.memberRepository.save(newMember);
      this.logger.log(`New member added to project ${projectId}: ${inviteeEmail}`);
      return savedMember;
    } catch (error) {
      this.logger.error(`Failed to add member to project ${projectId}:`, error);
      throw new Error('멤버 추가 중 오류가 발생했습니다.');
    }
  }

  // 팀원 삭제 (아이디로 삭제)
  async removeMember(projectId: number, userId: number, managerId: number): Promise<void> {
    
    // 1. 요청자의 권한 확인
    const manager = await this.memberRepository.findOne({
      where: { projectId, userId: managerId }
    });

    if (!manager) {
      throw new UnauthorizedException('프로젝트 관리자가 아닙니다.');
    }


    if (manager.authorization !== 1) {
      throw new UnauthorizedException('팀장만 멤버를 삭제할 수 있습니다.');
    }

    // 2. 삭제할 멤버 찾기
    const memberToRemove = await this.memberRepository.findOne({
      where: { projectId, userId }
    });

    if (!memberToRemove) {
      throw new NotFoundException('삭제할 사용자를 찾을 수 없습니다.');
    }

    // 3. 멤버 삭제
    const result = await this.memberRepository.delete({
      projectId,
      userId: memberToRemove.userId
    });

    if (result.affected === 0) {
      throw new NotFoundException('해당 멤버를 찾을 수 없습니다.');
    }

    this.logger.log(`Member removed from project ${projectId}: ${userId}`);
  }

  // 팀원 삭제 (아이디로 삭제)
  async removeMemberWithEmail(projectId: number, email: string, managerId: number): Promise<void> {

    // 1. 요청자의 권한 확인
    const manager = await this.memberRepository.findOne({
      where: { projectId, userId: managerId }
    });

    if (!manager) {
      throw new UnauthorizedException('프로젝트 관리자가 아닙니다.');
    }

    if (manager.authorization !== 1) {
      throw new UnauthorizedException('팀장만 멤버를 삭제할 수 있습니다.');
    }

    // 2. 삭제할 멤버 찾기
    const userInfo = await this.userRepository.findOne({
      where: { email: email }
    });

    if (!userInfo) {
      throw new NotFoundException('삭제할 사용자를 찾을 수 없습니다.');
    }


    // const memberToRemove = await this.memberRepository.findOne({
    //   where: { email: email }
    // });

    // if (!memberToRemove) {
    //   throw new NotFoundException('삭제할 사용자를 찾을 수 없습니다.');
    // }

    // // 2. 요청자의 권한 확인
    // const projectUser = await this.memberRepository.findOne({
    //   where: { projectId, userId: memberToRemove.id }
    // });

    // if (!projectUser) {
    //   throw new UnauthorizedException('프로젝트 멤버가 아닙니다.');
    // }

    // if (projectUser.authorization !== 1) {
    //   throw new UnauthorizedException('팀장만 멤버를 삭제할 수 있습니다.');
    // }

    

    // 3. 멤버 삭제
    const result = await this.memberRepository.delete({
      projectId,
      userId: userInfo.id
    });

    if (result.affected === 0) {
      throw new NotFoundException('해당 멤버를 찾을 수 없습니다.');
    }

    this.logger.log(`Member removed from project ${projectId}: ${email}`);
  }
  

  // 팀원 목록 조회
  async findAllMembers(projectId: number): Promise<ProjectMember[]> {
    const members = await this.memberRepository.find({
      where: { projectId },
      relations: ['user'],
      select: {
        user: {
          id: true,
          email: true,
          username: true
        }
      }
    });

    if (!members.length) {
      throw new NotFoundException('프로젝트 멤버가 없습니다.');
    }

    return members;
  }

  // 멤버 권한 수정
  async updateMemberAuthorization(
    projectId: number,
    memberEmail: string,
    newAuthorization: number,
    requesterId: number
  ): Promise<ProjectMember> {
    // 1. 요청자 권한 확인
    const requester = await this.memberRepository.findOne({
      where: { projectId, userId: requesterId }
    });

    if (!requester || requester.authorization !== 1) {
      throw new UnauthorizedException('팀장만 권한을 수정할 수 있습니다.');
    }

    // 2. 수정할 멤버 찾기
    const memberToUpdate = await this.userRepository.findOne({
      where: { email: memberEmail }
    });

    if (!memberToUpdate) {
      throw new NotFoundException('수정할 사용자를 찾을 수 없습니다.');
    }

    // 3. 멤버 권한 수정
    const membership = await this.memberRepository.findOne({
      where: { projectId, userId: memberToUpdate.id }
    });

    if (!membership) {
      throw new NotFoundException('프로젝트 멤버가 아닙니다.');
    }

    membership.authorization = newAuthorization;
    return await this.memberRepository.save(membership);
  }
}