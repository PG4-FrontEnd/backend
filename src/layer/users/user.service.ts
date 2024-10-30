import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import axios from 'axios';
import { CreateUserDto, UpdateUserDto } from './user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService
  ) {}

  // 사용자 생성
  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.userRepository.findOneBy({ email: createUserDto.email });
    console.log('existingUser: ', existingUser);
    if (existingUser) {
      throw new UnauthorizedException('이미 존재하는 이메일입니다.');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    return this.userRepository.save(user);
  }

  // 모든 사용자 조회
  async findAllUser(): Promise<User[]> {
    return this.userRepository.find({
      select: ['id', 'email', 'username', 'created_at'] // 비밀번호 제외
    });
  }

  // 이메일로 사용자 조회
  async findUser(email: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ email });
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }
    return user;
  }

  // ID로 사용자 조회
  async findUserById(id: number): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }
    return user;
  }

  // 이메일로 사용자 정보 수정
  async updateUser(email: string, updateData: UpdateUserDto): Promise<User> {
    const user = await this.findUser(email);
    
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    const updatedUser = Object.assign(user, updateData);
    return this.userRepository.save(updatedUser);
  }

  // ID로 사용자 정보 수정
  async updateUserId(id: number, updateData: UpdateUserDto): Promise<User> {
    console.log('updateData1: ', updateData)
    const user = await this.findUserById(id);
    
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }
    console.log('updateData2: ', updateData)

    const updatedUser = Object.assign(user, updateData);
    console.log('updatedUser: ', updatedUser)
    let createdUser = this.userRepository.save(updatedUser);
    return createdUser;
  }

  // 사용자 삭제
  async deleteUser(id: number): Promise<void> {
    const result = await this.userRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }
  }

  // 로그인 처리
  async login(email: string, password: string) {
    const user = await this.findUser(email);
    console.log('user: ', user);

    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('isPasswordValid: ', isPasswordValid)
    
    if (!user || !isPasswordValid) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 잘못되었습니다.');
    }

    const tokens = await this.generateTokens(user);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        username: user.username
      }
    };
  }

  // GitHub OAuth 처리
  async handleGithubLogin(code: string) {
    try {
      const { access_token } = await this.getGithubAccessToken(code);
      const githubUser = await this.getGithubUserInfo(access_token);
      
      let user = await this.userRepository.findOne({ 
        where: { email: githubUser.email } 
      });

      if (!user) {
        user = await this.createGithubUser(githubUser, access_token);
      } else {
        user = await this.updateGithubToken(user, access_token);
      }

      const tokens = await this.generateTokens(user);
      await this.updateRefreshToken(user.id, tokens.refreshToken);

      return {
        ...tokens,
        githubAccessToken: access_token,
        user: {
          id: user.id,
          email: user.email,
          username: user.username
        }
      };
    } catch (error) {
      throw new UnauthorizedException('GitHub 로그인 처리 중 오류가 발생했습니다.');
    }
  }

  // Refresh Token으로 새 Access Token 발급
  async refreshAccessToken(refreshToken: string): Promise<string> {
    try {
      const payload = await this.verifyToken(refreshToken);
      const user = await this.findUser(payload.email);

      if (!user || user.refreshToken !== refreshToken) {
        throw new UnauthorizedException('유효하지 않은 refresh token입니다.');
      }

      return this.generateAccessToken(user);
    } catch {
      throw new UnauthorizedException('토큰이 만료되었습니다.');
    }
  }

  // Private Helper Methods
  private async generateTokens(user: User) {
    const accessToken = await this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user);

    return { accessToken, refreshToken };
  }

  private async generateAccessToken(user: User): Promise<string> {
    return this.jwtService.sign(
      { id: user.id, email: user.email },
      {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: '5h'
      }
    );
  }

  private async generateRefreshToken(user: User): Promise<string> {
    return this.jwtService.sign(
      { id: user.id, email: user.email },
      {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: '28d'
      }
    );
  }

  private async verifyToken(token: string) {
    return this.jwtService.verify(token, {
      secret: this.configService.get<string>('JWT_SECRET')
    });
  }

  private async updateRefreshToken(userId: number, refreshToken: string): Promise<void> {
    await this.userRepository.update(userId, { refreshToken });
  }

  private async getGithubAccessToken(code: string) {
    const response = await axios.post('https://github.com/login/oauth/access_token', {
      client_id: this.configService.get<string>('GITHUB_CLIENT_ID'),
      client_secret: this.configService.get<string>('GITHUB_CLIENT_SECRET'),
      code
    }, {
      headers: { Accept: 'application/json' }
    });

    return response.data;
  }

  private async getGithubUserInfo(accessToken: string) {
    const response = await axios.get('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    return response.data;
  }

  private async createGithubUser(githubUser: any, accessToken: string): Promise<User> {
    const user = this.userRepository.create({
      email: githubUser.email,
      username: githubUser.login,
      password: await bcrypt.hash('github-oauth', 10),
      githubAccessToken: accessToken
    });

    return this.userRepository.save(user);
  }

  private async updateGithubToken(user: User, accessToken: string): Promise<User> {
    user.githubAccessToken = accessToken;
    return this.userRepository.save(user);
  }
}