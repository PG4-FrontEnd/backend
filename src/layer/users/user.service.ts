import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import axios from 'axios';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService
  ) {}

  async createUser(user: User): Promise<User> {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    user.password = hashedPassword;
    return this.userRepository.save(user);
  }

  findAllUser(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findUser(email: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ email });
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }
    return user;
  }

  async findUserById(id: number): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }
    return user;
  }

  async updateUser(email: string, updateData: Partial<User>): Promise<User> {
    const user = await this.findUser(email);
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }
    Object.assign(user, updateData);
    return this.userRepository.save(user);
  }

  async updateUserId(id: number, updateData: Partial<User>): Promise<User> {
    const user = await this.findUserById(id);
    // if (updateData.password) {
    //   updateData.password = await bcrypt.hash(updateData.password, 10);
    // }
    Object.assign(user, updateData);
    return this.userRepository.save(user);
  }

  async deleteUser(id: number): Promise<void> {
    const result = await this.userRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }
  }

  // 로그인 처리
  async login(email: string, password: string) {
    const user = await this.findUser(email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 잘못되었습니다.');
    }

    const jwtSecret = this.configService.get<string>('JWT_SECRET');

    // JWT 토큰 생성 (내부 서비스용)
    const accessToken = this.jwtService.sign(
      { id: user.id, email: user.email },
      {
        secret: jwtSecret,
        expiresIn: '5h'
      }
    );

    // Refresh Token 생성
    const refreshToken = this.jwtService.sign(
      { id: user.id, email: user.email },
      {
        secret: jwtSecret,
        expiresIn: '28d'
      }
    );

    // Refresh Token을 DB에 저장
    user.refreshToken = refreshToken;
    await this.userRepository.save(user);

    return {
      accessToken,
      refreshToken,
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
      // GitHub access token 발급
      const tokenResponse = await axios.post('https://github.com/login/oauth/access_token', {
        client_id: this.configService.get<string>('GITHUB_CLIENT_ID'),
        client_secret: this.configService.get<string>('GITHUB_CLIENT_SECRET'),
        code
      }, {
        headers: { Accept: 'application/json' }
      });

      const { access_token } = tokenResponse.data;

      // GitHub 사용자 정보 조회
      const userResponse = await axios.get('https://api.github.com/user', {
        headers: { Authorization: `Bearer ${access_token}` }
      });

      const githubUser = userResponse.data;

      // 사용자 정보 저장/업데이트
      let user = await this.userRepository.findOne({ where: { email: githubUser.email } });
      if (!user) {
        user = await this.createUser({
          email: githubUser.email,
          username: githubUser.login,
          password: 'github-oauth', // GitHub 로그인은 비밀번호 불필요
          githubAccessToken: access_token
        } as User);
      } else {
        user.githubAccessToken = access_token;
        await this.userRepository.save(user);
      }

      const jwtSecret = this.configService.get<string>('JWT_SECRET');

      // JWT 토큰 생성 (내부 서비스용)
      const accessToken = this.jwtService.sign(
        { id: user.id, email: user.email },
        {
          secret: jwtSecret,
          expiresIn: '5h'
        }
      );

      // Refresh Token 생성
      const refreshToken = this.jwtService.sign(
        { id: user.id, email: user.email },
        {
          secret: jwtSecret,
          expiresIn: '28d'
        }
      );

      // Refresh Token을 DB에 저장
      user.refreshToken = refreshToken;
      await this.userRepository.save(user);

      return {
        accessToken,
        refreshToken,
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
      const jwtSecret = this.configService.get<string>('JWT_SECRET');
      
      const payload = await this.jwtService.verify(refreshToken, {
        secret: jwtSecret
      });
      
      const user = await this.findUser(payload.email);
      if (!user || user.refreshToken !== refreshToken) {
        throw new UnauthorizedException('유효하지 않은 refresh token입니다.');
      }

      return this.jwtService.sign(
        { id: user.id, email: user.email },
        { 
          secret: jwtSecret,
          expiresIn: '5h' 
        }
      );
    } catch {
      throw new UnauthorizedException('토큰이 만료되었습니다.');
    }
  }
}