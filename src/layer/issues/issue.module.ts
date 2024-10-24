import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IssueController } from './issue.controller';
import { IssueService } from './issue.service';
import { Issue } from './issue.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Issue])],
  controllers: [IssueController],
  providers: [IssueService],
  exports: [IssueService],
})
export class IssueModule {}