import { Controller, Get, Post, Body, Request, Response, HttpStatus, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto } from 'src/layer/users/user.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() userDto: CreateUserDto) {
    return this.authService.register(userDto);
  }

	@Post('login')
	async login(@Request() req, @Response() res, @Body() userDto: LoginUserDto) {
		const jwt = await this.authService.validateUser(userDto)

		res.setHeader('Authorization', 'Bearer' + jwt.accessToken);

		return res.json(jwt);

	}

}