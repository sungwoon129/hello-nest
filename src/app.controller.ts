import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Controller(``)
export class AppController {
  constructor(private readonly configService: ConfigService) {}

  @Get()
  home() {
    return 'Welcome to my Movie API.';
  }

  @Get('env')
  getEnv(): string {
    return this.configService.get('TEST_VALUE');
  }
}
