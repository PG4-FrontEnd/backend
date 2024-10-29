
import { IsEmail, IsString, IsNotEmpty } from "class-validator";

export class CreateUserDto {
    @IsEmail()
    @IsNotEmpty()
    email!: string;

    @IsString()
    @IsNotEmpty()
    username!: string;

    @IsString()
    @IsNotEmpty()
    password!: string;

	@IsString()
	created_at: Date;
}

export class UpdateUserDto {
	@IsString()
	username: string;

	@IsString()
	password: string;
}

export class LoginUserDto {
	@IsEmail()
	email: string;

	@IsString()
	password: string;
}