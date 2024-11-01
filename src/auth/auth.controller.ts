import { Controller, Get, Post, Body, HttpStatus, UseGuards, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request, Response, urlencoded } from 'express'; // express의 Request와 Response 가져오기
import { GoogleAuthGuard } from './auth.guard';
import { UserService } from 'src/layer/users/user.service';
import { access } from 'fs';

@Controller('login')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService
  ) {}

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleAuth(@Req() req: Request){}

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleAuthRedirect(@Req() req: Request, @Res() res: Response) {
    const { user } = req;
    const token = await this.userService.getAccessToken(user)
    console.log(token);

    return res.json({
      accessToken : token,
      user
    });
  }

}
