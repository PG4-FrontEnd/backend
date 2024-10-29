import { IsString, IsNotEmpty, IsDateString } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  leader!: string;

  @IsString()
  @IsNotEmpty()
  repository!: string;

  @IsDateString()
  deadline!: Date;
}