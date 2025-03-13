import { Resolver, Query } from '@nestjs/graphql';
import { HelloService } from './hello.service';

@Resolver('Hello')
export class HelloResolver {
  constructor(private readonly helloService: HelloService) {}

  @Query('hello')
  hello() {
    return this.helloService.hello();
  }
}
