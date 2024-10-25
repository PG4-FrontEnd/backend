import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { CreateUserDto, UpdateUserDto } from './user.dto';
import { UserService } from './user.service';
import { User } from './user.entity';

@Controller('users') // 기본 URL 경로: /users
export class UserController {
  constructor(private readonly userService: UserService) {}

  // 사용자 생성하기
  @Post('/join')
  createUser(@Body() user: CreateUserDto): Promise<User> {
    return this.userService.createUser(user);
  }

  // 모든 사용자 가져오기
  @Get()
  findAll(): Promise<User[]> {
    return this.userService.findAllUser();
  }

  // ID로 특정 사용자 가져오기
  @Get(':email')
  findUser(@Param('email') email: string): Promise<User> {
    return this.userService.findUser(email);
  }

  // 사용자 업데이트하기
  @Put(':id')
  updateUser(
    @Param('id') id: string,
    @Body() user: UpdateUserDto,
  ): Promise<User> {
    return this.userService.updateUser(id, user);
  }

  // 사용자 삭제하기
  @Delete(':id')
  deleteUser(@Param('id') id: string): Promise<void> {
    return this.userService.deleteUser(+id);
  }
}