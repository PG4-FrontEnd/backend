// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import * as compression from 'compression';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ConfigService 사용
  const configService = app.get(ConfigService);

  // CORS 설정
  app.enableCors({
    origin: true, // 프로덕션 환경에서는 구체적인 도메인 지정 필요
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // 전역 파이프 설정 (DTO 유효성 검사)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,            // DTO에 정의되지 않은 속성 제거
      forbidNonWhitelisted: true, // DTO에 정의되지 않은 속성이 있으면 요청 자체를 막음
      transform: true,            // 타입 자동 변환 활성화
    }),
  );

  // 보안 미들웨어 설정
  app.use(helmet());              // 기본적인 보안 헤더 설정
  app.use(compression());         // 응답 압축

  // API 버전 접두사 설정
  app.setGlobalPrefix('api/v1');

  // Swagger 설정 (API 문서화)
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

bootstrap().catch((error) => {
  console.error('Application failed to start:', error);
  process.exit(1);
});
