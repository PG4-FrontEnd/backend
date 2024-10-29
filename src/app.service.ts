import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getTest(): string {  
    return '테스트';
  }
}