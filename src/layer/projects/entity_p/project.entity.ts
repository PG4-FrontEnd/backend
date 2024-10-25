// src/layer/projects/entity_p/project.entity.ts
// 프로젝트 테이블의 스키마를 정의하는 엔티티
// TypeORM을 사용하여 데이터베이스 테이블과 매핑됩니다.
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, OneToMany } from 'typeorm';
import { Issue } from '../../issues/entity_i/issue.entity';

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn()
  id: number; // 프로젝트 고유 식별자

  @Column()
  title: string; // 프로젝트 제목

  @Column()
  leader: string; // 프로젝트 리더

  @Column()
  repository: string; // 저장소 URL

  @CreateDateColumn()
  createdAt: Date; // 생성 일시

  @Column({ type: 'datetime' })
  deadline: Date; // 마감 기한

  // 이슈와의 관계 설정 (1:N)
  @OneToMany(() => Issue, issue => issue.project)
  issues: Issue[]; // 프로젝트에 속한 이슈들
}