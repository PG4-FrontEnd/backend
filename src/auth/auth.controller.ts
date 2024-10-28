import { Controller, Get, Post, Body, Request, Response, HttpStatus, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto } from 'src/layer/users/user.dto';
// import { LoginGuard } from './auth.guard';

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

	// @UseGuards(LoginGuard)
	// @Post('login2')
	// async login2(@Request() req, @Response() res) {
	// 	if (!req.cookies['login'] && req.user) {
	// 		res.cookie('login', JSON.stringify(req.user), {
	// 			httpOnly: true,
	// 			maxAge: 1000 * 60 * 60 * 24,
	// 		});
	// 	}
	// 	return res.send({ message: 'login2 success'})
	// }

	// @UseGuards(LoginGuard)
	// @Get('test-guard')
	// testGuard() {
	// 	return '로그인 시에만 보임';
	// }
}