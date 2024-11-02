import { Controller, Post, Delete, Get, Param, Body, UseGuards,  Req, ParseIntPipe} from '@nestjs/common';
import { MemberService } from './member.service';
import { LoginGuard } from '../../auth/auth.guard';
import { InviteMemberDto, RemoveMemberDto, UpdateMemberAuthorizationDto } from './dto_m/member.dto';
import { ApiTags, ApiOperation, ApiParam, ApiBearerAuth, ApiResponse,ApiBody } from '@nestjs/swagger';

interface RequestWithUser {
  user: {
    id: number;
    email: string;
  };
}

@ApiTags('members')
@Controller('projects/:projectId/members')
@UseGuards(LoginGuard)
@ApiBearerAuth()
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  @Post('invite')
  @ApiOperation({ summary: '팀원 초대', description: '이메일로 새로운 팀원을 초대합니다.' })
  @ApiParam({ name: 'projectId', description: '프로젝트 ID' })
  @ApiBody({ type: InviteMemberDto })
  @ApiResponse({ status: 201, description: '초대 성공' })
  @ApiResponse({ status: 401, description: '권한 없음' })
  @ApiResponse({ status: 404, description: '사용자를 찾을 수 없음' })
  async inviteMember(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Body() inviteDto: InviteMemberDto,
    @Req() req: RequestWithUser,
  ) {
    return this.memberService.addMember(
      projectId,
      inviteDto.email,
      req.user.id
    );
  }

  @Delete("/:userId")
  @ApiOperation({ summary: '팀원 삭제', description: '이메일로 팀원을 삭제합니다.' })
  @ApiParam({ name: 'projectId', description: '프로젝트 ID' })
  @ApiParam({ name: 'userId', description: '사용자 ID' })
  @ApiBody({ type: RemoveMemberDto })
  @ApiResponse({ status: 200, description: '삭제 성공' })
  @ApiResponse({ status: 401, description: '권한 없음' })
  @ApiResponse({ status: 404, description: '멤버를 찾을 수 없음' })
  async removeMember(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('userId', ParseIntPipe) userId: number,
    @Req() req: RequestWithUser,
  ) {
    return this.memberService.removeMember(
      projectId,
      userId,
      req.user.id
    );
  }

  @Delete("/email/del")
  @ApiOperation({ summary: '팀원 삭제', description: '이메일로 팀원을 삭제합니다.' })
  @ApiParam({ name: 'projectId', description: '프로젝트 ID' })
  @ApiBody({ type: RemoveMemberDto })
  @ApiResponse({ status: 200, description: '삭제 성공' })
  @ApiResponse({ status: 401, description: '권한 없음' })
  @ApiResponse({ status: 404, description: '멤버를 찾을 수 없음' })
  async removeMemberWithEmail(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Body() removeDto: RemoveMemberDto, 
    @Req() req: RequestWithUser,
  ) {
    return this.memberService.removeMemberWithEmail(
      projectId,
      removeDto.email,
      req.user.id
    );
  }

  @Get()
  @ApiOperation({ summary: '팀원 목록 조회', description: '프로젝트의 모든 팀원 정보를 조회합니다.' })
  @ApiParam({ name: 'projectId', description: '프로젝트 ID' })
  @ApiResponse({ 
    status: 200, 
    description: '조회 성공',
    schema: {
      type: 'array',
      items: {
        properties: {
          userId: { type: 'number' },
          projectId: { type: 'number' },
          authorization: { type: 'number' },
          user: {
            type: 'object',
            properties: {
              email: { type: 'string' },
              username: { type: 'string' }
            }
          }
        }
      }
    }
  })
  async findAll(
    @Param('projectId', ParseIntPipe) projectId: number
  ) {
    return this.memberService.findAllMembers(projectId);
  }

  @Post('authorization')
  @ApiOperation({ summary: '멤버 권한 수정', description: '팀원의 권한 레벨을 수정합니다.' })
  @ApiParam({ name: 'projectId', description: '프로젝트 ID' })
  @ApiBody({ type: UpdateMemberAuthorizationDto })
  @ApiResponse({ status: 200, description: '권한 수정 성공' })
  @ApiResponse({ status: 401, description: '권한 없음' })
  @ApiResponse({ status: 404, description: '멤버를 찾을 수 없음' })
  async updateAuthorization(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Body() updateDto: UpdateMemberAuthorizationDto,
    @Req() req: RequestWithUser,
  ) {
    return this.memberService.updateMemberAuthorization(
      projectId,
      updateDto.email,
      updateDto.authorization,
      req.user.id,
    );
  }
}