import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne, CreateDateColumn } from 'typeorm';
import { Issue } from '../issues/issue.entity';
import { User } from '../users/user.entity';

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ name: 'git_repository' })
  repository: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column()
  owner: string;

  @Column()
  token: string;

  @OneToMany(() => Issue, issue => issue.project)
  issues: Issue[];

  @ManyToOne(() => User)
  user: User;
}