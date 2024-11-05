import { IsString, IsNotEmpty, IsISO8601 } from 'class-validator';
import { Type } from 'class-transformer';
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

  @IsISO8601()
  @Type(() => Date)
  deadline!: string;
}