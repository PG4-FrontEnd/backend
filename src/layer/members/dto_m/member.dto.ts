import { IsNumber, IsNotEmpty } from 'class-validator';

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