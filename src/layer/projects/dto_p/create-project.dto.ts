// src/layer/projects/dto_p/create-project.dto.ts
// 프로젝트 생성 시 필요한 데이터의 형식을 정의하는 DTO
// 클라이언트로부터 받는 데이터의 유효성을 검증합니다.
import { IsString, IsNotEmpty, IsDateString } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  title: string; // 프로젝트 제목 (필수)

  @IsString()
  @IsNotEmpty()
  leader: string; // 프로젝트 리더 (필수)

  @IsString()
  @IsNotEmpty()
  repository: string; // 저장소 URL (필수)

  @IsDateString()
  deadline: Date; // 마감일 (날짜 형식)
}