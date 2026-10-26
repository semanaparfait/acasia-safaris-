import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class RoleDto {
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
