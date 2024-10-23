import { IsEmail, IsString } from "class-validator";

export class CreateUserDto {
	@IsEmail()
	email: string;

	@IsString()
	username: string;

	@IsString()
	password: string;

	@IsString()
	created_at: Date;
}

export class UpdateUserDto {
	@IsString()
	username: string;

	@IsString()
	password: string;
}