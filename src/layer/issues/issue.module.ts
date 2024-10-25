// src/layer/issues/issue.module.ts
// 이슈 관련 기능들을 묶어주는 모듈
// 이슈와 관련된 컨트롤러, 서비스, 엔티티를 등록합니다.
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IssueController } from './issue.controller';
import { IssueService } from './issue.service';
import { Issue } from './entity_i/issue.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Issue]) // Issue 엔티티 등록
  ],
  controllers: [IssueController], // 이슈 컨트롤러 등록
  providers: [IssueService], // 이슈 서비스 등록
  exports: [IssueService], // 다른 모듈에서 사용할 수 있도록 서비스 내보내기
})
export class IssueModule {}