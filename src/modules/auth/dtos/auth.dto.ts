import { IsBoolean, IsEmail, IsString, Min } from 'class-validator';

export class SignInDto {
  @IsEmail()
  email: string;

  @IsString()
  @Min(1)
  password: string;

  @IsBoolean()
  remember?: boolean;
}
