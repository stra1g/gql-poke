import { Module } from '@nestjs/common';
import { HelloService } from './hello.service';
import { HelloResolver } from './hello.resolver';

@Module({
  providers: [HelloResolver, HelloService],
})
export class HelloModule {}
