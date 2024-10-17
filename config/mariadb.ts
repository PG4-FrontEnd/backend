import mariadb from 'mysql2';
import { DB_NAME, DB_PASSWORD } from './config';

const connection = mariadb.createConnection({
	host: 'localhost',
	user: 'rynthandew',
	password: DB_PASSWORD,
	database: DB_NAME,
	dateStrings: true
})

export default connection;