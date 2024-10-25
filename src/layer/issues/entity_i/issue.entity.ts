// src/layer/issues/entity_i/issue.entity.ts
// 이슈 테이블의 스키마를 정의하는 엔티티
// TypeORM을 사용하여 데이터베이스 테이블과 매핑됩니다.
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Project } from '../../projects/entity_p/project.entity';

@Entity('issues')
export class Issue {
  @PrimaryGeneratedColumn()
  id: number; // 이슈 고유 식별자

  @Column()
  title: string; // 이슈 제목

  @Column()
  manager: string; // 이슈 담당자

  @Column('text')
  contents: string; // 이슈 내용

  @CreateDateColumn()
  createdAt: Date; // 생성 일시

  @Column({ type: 'datetime' })
  deadline: Date; // 마감 기한

  @Column()
  tagId: number; // 이슈 태그 ID

  @Column()
  order: number; // 이슈 순서

  @Column()
  projectId: number; // 프로젝트 ID

  // 프로젝트와의 관계 설정
  @ManyToOne(() => Project, project => project.issues)
  @JoinColumn({ name: 'projectId' })
  project: Project;
}