import { Controller, Get, Post, Body, HttpStatus, UseGuards, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto } from 'src/layer/users/user.dto';
import { Request, Response } from 'express'; // express의 Request와 Response 가져오기

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() userDto: CreateUserDto) {
    return this.authService.register(userDto);
  }

  @Post('login')
  async login(@Req() req: Request, @Res() res: Response, @Body() userDto: LoginUserDto) {
    const jwt = await this.authService.validateUser(userDto);

    res.setHeader('Authorization', 'Bearer ' + jwt.accessToken); // 공백 추가

    return res.json(jwt);
  }
}
