// src/layer/issues/dto_i/update-issue.dto.ts
// 이슈 수정 시 필요한 데이터의 형식을 정의하는 DTO
// 수정 가능한 필드들을 선택적으로 정의합니다.
import { IsString, IsOptional, IsNumber, IsDateString } from 'class-validator';

export class UpdateIssueDto {
  @IsString()
  @IsOptional()
  title?: string; // 이슈 제목 (선택)

  @IsString()
  @IsOptional()
  manager?: string; // 담당자 (선택)

  @IsString()
  @IsOptional()
  contents?: string; // 이슈 내용 (선택)

  @IsDateString()
  @IsOptional()
  startDate?: Date; // 시작일 필드 추가

  @IsDateString()
  @IsOptional()
  deadline?: Date; // 마감일 (선택)

  @IsNumber()
  @IsOptional()
  tagId?: number; // 태그 ID (선택)

  @IsNumber()
  @IsOptional()
  order?: number; // 이슈 순서 (선택)
}