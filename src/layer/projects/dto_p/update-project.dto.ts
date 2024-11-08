// src/layer/projects/dto_p/update-project.dto.ts
// 프로젝트 수정 시 필요한 데이터의 형식을 정의하는 DTO
// 수정 가능한 필드들을 선택적으로 정의합니다.
import { IsString, IsOptional, IsDateString } from 'class-validator';

export class UpdateProjectDto {
  @IsString()
  @IsOptional()
  title?: string; // 프로젝트 제목 (선택)

  @IsString()
  @IsOptional()
  leader?: string; // 프로젝트 리더 (선택)

  @IsString()
  @IsOptional()
  deadline?: string; // 마감일 (선택)

  @IsString()
  @IsOptional()
  startDate?: string;
}