import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../layer/users/user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    UsersModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: '5h', // Access Token 유효기간
        }
      }),
    }),
  ],
  providers: [
    AuthService,
    // Refresh Token 설정을 위한 Provider
    {
      provide: 'REFRESH_TOKEN_CONFIG',
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_REFRESH_SECRET') || configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: '28d'
        }
      }),
      inject: [ConfigService],
    }
  ],
  controllers: [AuthController],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}