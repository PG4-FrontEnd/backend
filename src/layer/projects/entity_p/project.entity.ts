
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, OneToMany } from 'typeorm';
import { Issue } from '../../issues/entity_i/issue.entity';
import { ProjectMember } from '../../members/entity_m/entity.member';

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

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @Column({ type: 'datetime' })
  deadline!: Date;

  @OneToMany(() => Issue, issue => issue.project)
  issues!: Issue[];

  @OneToMany(() => ProjectMember, member => member.project)
  members!: ProjectMember[];
}