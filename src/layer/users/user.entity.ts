import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column()
  username!: string;

  @Column({ nullable: true })
  refreshToken?: string;

  @Column({ nullable: true })
  githubAccessToken?: string;
}
