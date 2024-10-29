import { IsString, IsNotEmpty, IsNumber, IsDateString } from 'class-validator';

export class CreateIssueDto {
  @IsString()
  @IsNotEmpty()
  title!: string;  // 느낌표(!) 추가

  @IsString()
  @IsNotEmpty()
  manager!: string;

  @IsString()
  @IsNotEmpty()
  contents!: string;

  @IsDateString()
  deadline!: Date;

  @IsNumber()
  tagId!: number;

  @IsNumber()
  order!: number;
}