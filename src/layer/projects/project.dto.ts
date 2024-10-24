import { IsString, IsUrl } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  title: string;

  @IsString()
  owner: string;

  @IsUrl()
  repository: string;

  @IsString()
  token: string;
}

export class UpdateProjectDto {
  @IsString()
  title?: string;

  @IsString()
  owner?: string;

  @IsUrl()
  repository?: string;
}