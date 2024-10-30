import { Controller, Post, Body, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto } from '../layer/users/user.dto';
import { Response } from 'express';

@Controller('auth1')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  async register(@Body() createUserDto: CreateUserDto) {
    return await this.authService.register(createUserDto);
  }

  @Post('/login')
  async login(
    @Body() loginDto: LoginUserDto,
    @Res() res: Response
  ) {
    const jwt = await this.authService.login(loginDto.email, loginDto.password);
    res.setHeader('Authorization', 'Bearer ' + jwt.accessToken);
    return res.json(jwt);
  }
}