import { IsOptional, IsArray, IsString } from 'class-validator';

export class CreatePokemonInput {
  @IsString()
  name: string;

  @IsArray()
  @IsString({ each: true })
  types: string[];
}

export class UpdatePokemonInput {
  @IsString()
  @IsOptional()
  name: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  types: string[];
}
