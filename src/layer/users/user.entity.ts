import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {

  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ unique: true })
  email!: string;

  @Column({ nullable: true })
  password!: string;

  @Column()
  username!: string;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP"})
  created_at: Date = new Date();

  @Column({ nullable: true })
  refreshToken?: string;

  @Column({ nullable: true })
  githubAccessToken?: string;

  @Column({ nullable: true })
  providerId?: string;
}
