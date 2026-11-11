import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator'

// Login payload — validated by the global ValidationPipe (main.ts).
export class LoginDto {
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  username!: string

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  password!: string

  // Only needed when the same username exists in more than one installation.
  @IsOptional()
  @IsString()
  @MaxLength(32)
  facilityCode?: string
}
