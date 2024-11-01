import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { UserService } from '../layer/users/user.service';
import * as bcrypt from 'bcrypt';
import { CreateUserDto, LoginUserDto } from 'src/layer/users/user.dto';
import { JwtService } from '@nestjs/jwt';
import { Payload } from './jwt.payload';

@Injectable()
export class AuthService { 
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async register(userDto: CreateUserDto) {
    const user = await this.userService.findUser(userDto.email);
    if (user) {
      throw new HttpException(
        '이미 가입된 이메일입니다.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const encryptedPassword = bcrypt.hashSync(userDto.password, 10);

    try {
      const newUser = await this.userService.createUser({
        ...userDto,
        password: encryptedPassword,
		    created_at: new Date(),
      });
      const { password, ...userWithoutPassword } = newUser; // password 속성을 제외한 새로운 객체 생성
    return userWithoutPassword;
    } catch (error) {
      throw new HttpException((error as Error).message || 'Internal Server Error', 500);
    }
  }

  async validateUser(userDto: LoginUserDto): Promise<any> {
    const user = await this.userService.findUser(userDto.email);
    if (user && user.password && await bcrypt.compare(userDto.password, user.password)) {
      if (user.id === undefined) {
        throw new HttpException('User ID is undefined', HttpStatus.INTERNAL_SERVER_ERROR);
      }
      
      const payload: Payload = { id: user.id, email: user.email }; // user.id는 이제 string으로 보장됨
      const secretKey = process.env.JWT_SECRET_KEY || 'defaultSecret'; // 기본값 설정
      return {
        accessToken: this.jwtService.sign(payload, { secret: secretKey }),
      };
    }
    return null;
  }
}
