import { Controller, Post, Delete, Get, Param, UseGuards, Request } from '@nestjs/common';
import { MemberService } from './member.service';
import { AuthGuard } from '../../common/guards/auth.guard';

@Controller('projects/:projectId/members')
@UseGuards(AuthGuard)
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  @Post(':userId')
  async addMember(
    @Param('projectId') projectId: string,
    @Param('userId') userId: string,
    @Request() req: any
  ) {
    return this.memberService.addMember(+projectId, +userId, req.user.id);
  }

  @Delete(':userId')
  async removeMember(
    @Param('projectId') projectId: string,
    @Param('userId') userId: string,
    @Request() req: any
  ) {
    return this.memberService.removeMember(+projectId, +userId, req.user.id);
  }

  @Get()
  async findAll(@Param('projectId') projectId: string) {
    return this.memberService.findAllMembers(+projectId);
  }
}