import { Controller, Get, Res, Req, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express'; // express의 Request와 Response 가져오기
import { GoogleAuthGuard } from './google.guard';
import { UserService } from 'src/layer/users/user.service';

@Controller('login')
export class LoginController {
  constructor(
    private userService: UserService,
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