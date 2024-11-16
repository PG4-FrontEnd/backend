import {
  Controller,
  Get,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
  Req,
  Res,
  Post,
} from "@nestjs/common";
import { UpdateUserDto } from "./user.dto";
import { UserService } from "./user.service";
import { User } from "./user.entity";
import { LoginGuard } from "src/auth/auth.guard";

@Controller("auth")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post("/github/callback")
  async githubCallback(@Body("code") code: string) {
    return this.userService.handleGithubLogin(code);
  }

  @Get()
  @UseGuards(LoginGuard)
  findAll(): Promise<User[]> {
    return this.userService.findAllUser();
  }

  @Get(":email")
  @UseGuards(LoginGuard)
  findUser(@Param("email") email: string): Promise<User> {
    return this.userService.findUser(email);
  }

  @Put(":id")
  @UseGuards(LoginGuard)
  updateUser(
    @Param("id") id: string,
    @Body() user: UpdateUserDto
  ): Promise<User> {
    return this.userService.updateUser(id, user);
  }

  @Delete(":id")
  @UseGuards(LoginGuard)
  deleteUser(@Param("id") id: string): Promise<void> {
    return this.userService.deleteUser(+id);
  }
}
