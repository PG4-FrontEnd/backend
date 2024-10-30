import { IsString, IsNotEmpty, IsNumber, IsDateString } from 'class-validator';

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

  @IsNumber()
  @IsNotEmpty()
  order!: number;

  @IsNumber()
  @IsNotEmpty()
  userId!: number;
}