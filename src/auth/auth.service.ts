import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { UserService } from '../layer/users/user.service';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from 'src/layer/users/user.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService
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

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userService.findUser(email);
    if (user && (await bcrypt.compareSync(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

}