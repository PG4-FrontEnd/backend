import {
  Injectable,
  HttpException,
  HttpStatus,
  UnauthorizedException,
} from "@nestjs/common";
import { UserService } from "../layer/users/user.service";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { CreateUserDto } from "../layer/users/user.dto";
import { User } from "../layer/users/user.entity";

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService
  ) {}

  async register(createUserDto: CreateUserDto) {
    const existingUser = await this.userService
      .findUser(createUserDto.email)
      .catch(() => null);

    if (existingUser) {
      throw new HttpException(
        "이미 가입된 이메일입니다.",
        HttpStatus.BAD_REQUEST
      );
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    try {
      const newUser = await this.userService.createUser({
        email: createUserDto.email,
        username: createUserDto.username,
        password: hashedPassword,
      } as User);

      const { password, ...result } = newUser;
      return result;
    } catch (error) {
      throw new HttpException(
        (error as Error).message || "Internal Server Error",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async login(email: string, password: string) {
    const user = await this.userService.findUser(email);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException("이메일 또는 비밀번호가 잘못되었습니다.");
    }

    const payload = { id: user.id, email: user.email };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: "5h",
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: "28d",
    });

    // Refresh Token을 DB에 저장
    user.refreshToken = refreshToken;
    await this.userService.updateUser(user.email, { refreshToken });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    };
  }
}
