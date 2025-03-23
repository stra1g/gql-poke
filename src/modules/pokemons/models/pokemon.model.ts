import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class Pokemon {
  @Field(() => Int)
  id: number;

  @Field()
  name: string;

  @Field()
  type: string;

  @Field()
  created_at: number;
}
