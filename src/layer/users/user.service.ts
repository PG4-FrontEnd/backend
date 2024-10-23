import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';


@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User, process.env.DB_DATABASE)
    private userRepository: Repository<User>,
  ) {}

  // 사용자 생성하기
  async createUser(user: User): Promise<User> {
    return this.userRepository.save(user);
  }

  // 모든 사용자 가져오기
  findAllUser(): Promise<User[]> {
    return this.userRepository.find();
  }

  // ID로 사용자 찾기 
  findUser(email: string): Promise<User> {
    return this.userRepository.findOneBy({ email });
  }

  // 사용자 업데이트하기
  async updateUser(email: string, updateData: Partial<User>): Promise<User> {
    const user = await this.findUser(email);
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }
    Object.assign(user, updateData);
    return this.userRepository.save(user);
  }

  // 사용자 삭제하기
  async deleteUser(id: number): Promise<void> {
    await this.userRepository.delete(id);
  }
}