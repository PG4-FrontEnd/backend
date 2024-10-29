import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import * as compression from 'compression';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

function bootstrap() {
  return NestFactory.create(AppModule).then(app => {
    // ConfigService 사용
    const configService = app.get(ConfigService);

    // 환경 변수 로깅 추가
    console.log('Database Configuration:', {
      DB_HOST: configService.get('DB_HOST'),
      DB_PORT: configService.get('DB_PORT'),
      DB_USERNAME: configService.get('DB_USERNAME'),
      DB_DATABASE: configService.get('DB_DATABASE'),
      NODE_ENV: configService.get('NODE_ENV')
    });

    // CORS 설정
    app.enableCors({
      origin: true,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true,
    });

    // 전역 파이프 설정
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    // 보안 미들웨어 설정
    app.use(helmet());
    app.use(compression());

    // API 버전 접두사 설정
    app.setGlobalPrefix('api/v1');

    // Swagger 설정
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Ryn Project API')
      .setDescription('Ryn Project API Documentation')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api-docs', app, document);

    // 서버 시작
    const port = configService.get<number>('SERVER_PORT') || 3000;
    return app.listen(port).then(() => {
      console.log(`
        ===============================
        🚀 Application is running on: http://localhost:${port}
        📚 API Documentation: http://localhost:${port}/api-docs
        🔒 Mode: ${configService.get<string>('NODE_ENV')}
        ===============================
      `);
    });
  }).catch((error) => {
    console.error('Application failed to start:', error);
    // 데이터베이스 연결 오류 상세 로깅
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('Database connection failed: Invalid credentials');
      console.error('Please check your database username and password');
    }
    if (error.code === 'ECONNREFUSED') {
      console.error('Database connection failed: Connection refused');
      console.error('Please check if your database server is running');
    }
    process.exit(1);
  });
}

bootstrap();