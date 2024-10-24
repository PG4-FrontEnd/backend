import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Project } from '../projects/project.entity';

export enum IssueStatus {
  TODO = '할 일',
  IN_PROGRESS = '진행 중',
  PR_REVIEW = 'PR 및 코드 리뷰',
  DONE = '완료'
}

@Entity('issues')
export class Issue {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({
    type: 'enum',
    enum: IssueStatus,
    default: IssueStatus.TODO
  })
  status: IssueStatus;

  @Column()
  manager: string;

  @Column('text')
  contents: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ default: 0 })
  order: number;

  @ManyToOne(() => Project, project => project.issues)
  project: Project;
}