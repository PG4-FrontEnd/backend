import { Controller, Post, Body, Res } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { CreateUserDto, LoginUserDto } from "../layer/users/user.dto";
import { RefreshTokenDto, TokenResponseDto } from "./jwt.dto";
import { Response } from "express";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("/register")
  @ApiOperation({ summary: "회원가입" })
  async register(@Body() createUserDto: CreateUserDto) {
    return await this.authService.register(createUserDto);
  }

  @Post("/login")
  @ApiOperation({ summary: "로그인" })
  async login(@Body() loginDto: LoginUserDto, @Res() res: Response) {
    const jwt = await this.authService.login(loginDto.email, loginDto.password);
    res.setHeader("Authorization", "Bearer " + jwt.accessToken);
    return res.json(jwt);
  }

  @Post("/refresh")
  @ApiOperation({ summary: "토큰 갱신" })
  @ApiResponse({
    status: 200,
    description: "토큰 갱신 성공",
    type: TokenResponseDto,
  })
  async refreshToken(@Body() body: RefreshTokenDto): Promise<TokenResponseDto> {
    return await this.authService.refreshAccessToken(body.refreshToken);
  }
}
