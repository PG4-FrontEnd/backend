import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import * as compression from 'compression';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  // Nest 애플리케이션 생성
  const app = await NestFactory.create(AppModule);
  
  // ConfigService를 사용하여 환경 변수 불러오기
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
      whitelist: true, // DTO에 정의된 속성만 허용
      forbidNonWhitelisted: true, // 허용되지 않은 속성의 요청을 차단
      transform: true, // 요청 데이터를 DTO로 변환
    }),
  );

  // 쿠키 파서 및 보안 미들웨어 설정
  app.use(cookieParser());
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
  await app.listen(port);
  console.log(`
    ===============================
    🚀 Application is running on: http://localhost:${port}
    📚 API Documentation: http://localhost:${port}/api-docs
    🔒 Mode: ${configService.get<string>('NODE_ENV')}
    ===============================
  `);
}

// 예외 처리 및 오류 로깅
bootstrap().catch((error) => {
  console.error('Application failed to start:', error);
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
