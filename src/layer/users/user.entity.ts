import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column()
  username!: string;

  @Column({ type: "datetime", default: () => "CURRENT_TIMESTAMP"})
  created_at: Date = new Date();

  @Column({ nullable: true })
  refreshToken?: string;

  @Column({ nullable: true })
  githubAccessToken?: string;
}
