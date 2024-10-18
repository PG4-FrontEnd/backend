import conn from '../../config/mariadb';
import { StatusCodes } from 'http-status-codes';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../../config/config';

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

					return res.status(StatusCodes.CREATED).end();
			}
	)
};

const login = (req, res) => {
	const { personalId, password } = req.body;

	let sql = 'SELECT * FROM users WHERE personal_id = ?';
	conn.query(sql, personalId,
			(err, results) => {
					if (err) {
							console.log(err);
							return res.status(StatusCodes.BAD_REQUEST).end(); // BAD REQUEST
					}

					const loginUser = results[0];

					// 로그인 시 받은 이메일 & 비밀번호 -> salt값 꺼내서 비밀번호 암호화
					const hashPassword =  crypto.pbkdf2Sync(password, loginUser.salt, 10000, 10, 'sha512').toString('base64');

					// 디비 비밀번호랑 비교
					if (loginUser && loginUser.password == hashPassword) {

							return res.status(StatusCodes.OK).json({ userId : loginUser.id });
					} else {
							return res.status(StatusCodes.UNAUTHORIZED).end();
					}

			}
	)    
};

export {
	join,
	login
}