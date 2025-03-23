import { IsOptional, IsString } from 'class-validator';

export class CreatePokemonInput {
  @IsString()
  name: string;

  @IsString()
  type: string;
}

export class UpdatePokemonInput {
  @IsString()
  @IsOptional()
  name: string;

  @IsString()
  @IsOptional()
  type: string;
}
