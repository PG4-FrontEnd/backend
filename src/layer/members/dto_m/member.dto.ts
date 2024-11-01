import { IsNumber, IsNotEmpty, IsEmail, IsOptional } from 'class-validator';

// 기본 프로젝트 멤버 DTO
export class ProjectMemberDto {
  @IsNumber()
  @IsNotEmpty()
  userId!: number;

  @IsNumber()
  @IsNotEmpty()
  projectId!: number;

  @IsNumber()
  @IsNotEmpty()
  authorization!: number;
}

// 멤버 초대 DTO
export class InviteMemberDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;
}

// 멤버 삭제 DTO
export class RemoveMemberDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;
}

// 멤버 권한 수정 DTO
export class UpdateMemberAuthorizationDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsNumber()
  @IsNotEmpty()
  authorization!: number;
}