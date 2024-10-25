// src/layer/issues/dto_i/create-issue.dto.ts
// 이슈 생성 시 필요한 데이터의 형식을 정의하는 DTO
// 클라이언트로부터 받는 데이터의 유효성을 검증합니다.
import { IsString, IsNotEmpty, IsNumber, IsDateString } from 'class-validator';

export class CreateIssueDto {
  @IsString()
  @IsNotEmpty()
  title: string; // 이슈 제목 (필수)

  @IsString()
  @IsNotEmpty()
  manager: string; // 담당자 (필수)

  @IsString()
  @IsNotEmpty()
  contents: string; // 이슈 내용 (필수)

  @IsDateString()
  deadline: Date; // 마감일 (날짜 형식)

  @IsNumber()
  tagId: number; // 태그 ID

  @IsNumber()
  order: number; // 이슈 순서
}