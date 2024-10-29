import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards } from '@nestjs/common';
import { CreateUserDto, UpdateUserDto } from './user.dto';
import { UserService } from './user.service';
import { User } from './user.entity';
import { AuthGuard } from '../../common/guards/auth.guard';

@Controller('auth')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/register')
  createUser(@Body() user: User): Promise<User> {
    return this.userService.createUser(user);
  }

  @Post('/login')
  async login(@Body() loginData: { email: string; password: string }) {
    return this.userService.login(loginData.email, loginData.password);
  }

  @Get('/github/callback')
  async githubCallback(@Body('code') code: string) {
    return this.userService.handleGithubLogin(code);
  }

  @UseGuards(AuthGuard)
  @Get()
  findAll(): Promise<User[]> {
    return this.userService.findAllUser();
  }

  @UseGuards(AuthGuard)
  @Get(':email')
  findUser(@Param('email') email: string): Promise<User> {
    return this.userService.findUser(email);
  }

  @UseGuards(AuthGuard)
  @Put(':id')
  updateUser(
    @Param('id') id: string,
    @Body() user: UpdateUserDto,
  ): Promise<User> {
    return this.userService.updateUser(id, user);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  deleteUser(@Param('id') id: string): Promise<void> {
    return this.userService.deleteUser(+id);
  }
}
