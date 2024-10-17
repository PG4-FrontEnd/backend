import conn from '../../config/mariadb';
import { StatusCodes } from 'http-status-codes';
import crypto from 'crypto';

const join = (req, res) => {
	const { personalId, name, email, password } = req.body;
	
	// 비밀번호 암호화
	const salt = crypto.randomBytes(10).toString('base64');
	const hashPassword = crypto.pbkdf2Sync(password, salt, 10000, 10, 'sha512').toString('base64');
	
	console.log(hashPassword);
	
	// 회원가입 시 비밀번호를 암호화해서 암호화된 비밀번호와 salt 값을 같이 저장
	let values = [ personalId, name, email, hashPassword, salt];
	let sql = 'INSERT INTO users (personal_id, name, email, password, salt) VALUES (?, ?, ?, ?, ?)';

	conn.query(sql, values,
			(err, results) => {
					if (err) {
							console.log(err);
							return res.status(StatusCodes.BAD_REQUEST).end(); // BAD REQUEST
					}

					return res.status(StatusCodes.CREATED).json(results);
			}
	)
};

export {
	join
}