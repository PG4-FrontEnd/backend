
import { IsEmail, IsString, IsNotEmpty } from "class-validator";

export class CreateUserDto {
    @IsEmail()
    email!: string;

    @IsString()
    @IsNotEmpty()
    username!: string;

    @IsString()
    @IsNotEmpty()
    password: string;

	constructor(email: string, password: string) {
		this.email = email;
		this.password = password; // 생성자에서 초기화
	  }
}

export class UpdateUserDto {
	@IsString()
	username!: string;

	@IsString()
	password!: string;
}

export class LoginUserDto {
	@IsEmail()
	email!: string;

	@IsString()
	password!: string;
}