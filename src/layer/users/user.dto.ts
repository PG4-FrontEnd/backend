
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

    created_at: Date = new Date();  
}

export class UpdateUserDto {
    @IsString()
    username!: string;  

    @IsString()
    password!: string;  
}