import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';

@Injectable()
export class ConfigurationService {
  private readonly envConfig: { [key: string]: string };

  constructor() {
    dotenv.config();
    this.envConfig = process.env;
  }

  get(key: string): string {
    return this.envConfig[key];
  }

  getNumber(key: string): number {
    return Number(this.envConfig[key]);
  }

  getBoolean(key: string): boolean {
    return this.envConfig[key] === 'true';
  }
}
