import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class UpdatePokemonInput {
  @Field()
  name: string;

  @Field()
  type: string;
}
