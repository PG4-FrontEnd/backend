import dotenv from 'dotenv';

dotenv.config();

// mariadb
const DB_PASSWORD = process.env.DBPASSWORD;
const DB_NAME = process.env.DATABASE

export {
	DB_PASSWORD,
	DB_NAME
}

//jwt
export const JWT_SECRET: string | null = `${process.env.JWT_SECRET}`;
