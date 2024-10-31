import { Controller, Post, Body, Res, UnauthorizedException, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto } from '../layer/users/user.dto';
import { Response } from 'express';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBody,
  ApiProperty,
  ApiBearerAuth 
} from '@nestjs/swagger';

class RefreshTokenDto {
  @ApiProperty({
    description: '리프레시 토큰',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  })
  refreshToken!: string;
}

class TokenResponseDto {
  @ApiProperty({
    description: '새로 발급된 액세스 토큰',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  })
  accessToken!: string;
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  @ApiOperation({ summary: '회원가입' })
  async register(@Body() createUserDto: CreateUserDto) {
    return await this.authService.register(createUserDto);
  }

  @Post('/login')
  @ApiOperation({ summary: '로그인' })
  async login(
    @Body() loginDto: LoginUserDto,
    @Res() res: Response
  ) {
    const jwt = await this.authService.login(loginDto.email, loginDto.password);
    res.setHeader('Authorization', 'Bearer ' + jwt.accessToken);
    return res.json(jwt);
  }

  @Post('/refresh')
  @ApiOperation({ summary: '토큰 갱신' })
  async refreshToken(
    @Body() body: RefreshTokenDto
  ): Promise<TokenResponseDto> {
    const accessToken = await this.authService.refreshAccessToken(body.refreshToken);
    return { accessToken };
  }
}