import { IsEmail, IsString, IsNotEmpty, IsOptional } from "class-validator";

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
}

export class LoginUserDto {
    @IsEmail()
    @IsNotEmpty()
    email!: string;

    @IsString()
    @IsNotEmpty()
    password!: string;
}

export class UpdateUserDto {
    @IsString()
    @IsOptional()
    username?: string;

    @IsString()
    @IsOptional()
    password?: string;
}