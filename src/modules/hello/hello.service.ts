import { Injectable } from '@nestjs/common';

@Injectable()
export class HelloService {
  constructor() {}

  async hello() {
    return 'Hello World!';
  }
}
