import mariadb from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

const connection = mariadb.createConnection({
	host: 'localhost',
	user: 'rynthandew',
	password: process.env.DBPASSWORD,
	database: process.env.DATABASE,
	dateStrings: true
})

export default connection;