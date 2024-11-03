import { Module } from '@nestjs/common'
import { LoginController } from './login.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GoogleStrategy } from './google.strategy';
import { UsersModule } from 'src/layer/users/user.module';
import { DatabaseModule } from 'src/config/database/mariadb.module';
import { AuthService } from '../auth/auth.service';

@Module({
  imports: [
    UsersModule,
		DatabaseModule,
		JwtModule,
		ConfigModule,
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
    },
		GoogleStrategy
  ],
  controllers: [LoginController],
})

export class LoginModule {}