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
			const user = await this.userService.createUser({
				...userDto,
				password: encryptedPassword
			})
			user.password = undefined;
			return user;
		} catch (error) {
			throw new HttpException(error, 500);
		}

	}

  async validateUser(userDto: LoginUserDto): Promise<any> {
    const user = await this.userService.findUser(userDto.email);
    if (user && (await bcrypt.compareSync(userDto.password, user.password))) {
			const payload: Payload = { id: user.id, email: user.email }

      return {
				accessToken: this.jwtService.sign(payload, { secret: process.env.JWT_SECRET_KEY }),
			}
    }

    return null;
  }

}