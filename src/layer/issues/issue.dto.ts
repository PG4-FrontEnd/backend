import { IsString, IsNumber, IsOptional, IsEnum } from 'class-validator';
import { IssueStatus } from './issue.entity';

export class CreateIssueDto {
  @IsString()
  title: string;

  @IsString()
  manager: string;

  @IsString()
  contents: string;

  @IsOptional()
  @IsEnum(IssueStatus)
  status?: IssueStatus = IssueStatus.TODO;

  @IsOptional()
  @IsNumber()
  order?: number = 0;
}

export class UpdateIssueDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  manager?: string;

  @IsOptional()
  @IsString()
  contents?: string;

  @IsOptional()
  @IsEnum(IssueStatus)
  status?: IssueStatus;

  @IsOptional()
  @IsNumber()
  order?: number;
}
