import { Type } from "class-transformer";
import { IsNumber, IsNotEmpty, IsEmail, ValidateNested } from "class-validator";

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

export class UserDto {
  @IsNotEmpty()
  username!: string;

  @IsEmail()
  @IsNotEmpty()
  email!: string;
}

// 멤버 초대 DTO
export class InviteMemberDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ValidateNested()
  @Type(() => UserDto)
  user!: UserDto;
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
