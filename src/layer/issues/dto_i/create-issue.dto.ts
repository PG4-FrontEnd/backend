import { IsString, IsNotEmpty, IsNumber, IsDateString, IsOptional } from 'class-validator';

export class CreateIssueDto {
  @IsString()
  @IsNotEmpty()
  title!: string; 

  @IsString()
  @IsNotEmpty()
  manager!: string;

  @IsString()
  @IsNotEmpty()
  contents!: string;

  @IsDateString()
  deadline!: string;

  @IsNumber()
  @IsNotEmpty()
  tagId!: number;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsNumber()
  @IsNotEmpty()
  order!: number;

  @IsNumber()
  @IsNotEmpty()
  userId!: number;
}