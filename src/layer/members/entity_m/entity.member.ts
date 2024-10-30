import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/user.entity';
import { Project } from '../../projects/entity_p/project.entity';

@Entity('projectMembers')
export class ProjectMember {
  @PrimaryColumn()
  userId!: number;

  @PrimaryColumn()
  projectId!: number;

  @Column()
  authorization!: number; // 권한 레벨 (예: 0-일반멤버, 1-팀장)

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user!: User;

  @ManyToOne(() => Project)
  @JoinColumn({ name: 'projectId' })
  project!: Project;
}