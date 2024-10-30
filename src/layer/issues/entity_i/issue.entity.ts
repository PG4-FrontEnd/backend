import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Project } from '../../projects/entity_p/project.entity';

@Entity('issues')
export class Issue {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @Column()
  manager!: string;

  @Column('text')
  contents!: string;

  @CreateDateColumn({name: 'created_at'})
  createdAt!: Date;

  @Column({ type: 'datetime' })
  deadline!: Date;

  @Column()
  tagId!: number;

  @Column()
  order!: number;

  @Column()
  projectId!: number;


  @Column({name: 'user_id'}) 
  userId!: number;

  @ManyToOne(() => Project, project => project.issues)
  @JoinColumn({ name: 'projectId' })
  project!: Project;
}