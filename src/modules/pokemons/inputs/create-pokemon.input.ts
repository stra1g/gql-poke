import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreatePokemonInput {
  @Field()
  name: string;

  @Field()
  type: string;
}
