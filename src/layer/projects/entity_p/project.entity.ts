import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, OneToMany } from 'typeorm';
import { Issue } from '../../issues/entity_i/issue.entity';

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @Column()
  leader!: string;

  @Column()
  repository!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @Column({ type: 'datetime' })
  deadline!: Date;

  @OneToMany(() => Issue, issue => issue.project)
  issues!: Issue[];
}