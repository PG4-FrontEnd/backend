
import { IsEmail, IsString } from "class-validator";

export class CreateUserDto {
    @IsEmail()
    email!: string; 

    @IsString()
    username!: string; 

    @IsString()
    password!: string; 

    created_at: Date = new Date();  
}

export class UpdateUserDto {
    @IsString()
    username!: string;  

    @IsString()
    password!: string;  
}