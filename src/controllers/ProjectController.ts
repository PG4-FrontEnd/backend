import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { body, validationResult } from 'express-validator';
import crypto from 'crypto';
import conn from '../../config/mariadb';

// 암호화 키 (환경 변수에서 가져오는 것이 좋습니다)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-secret-key';
const IV_LENGTH = 16;

// 암호화 함수
function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

// 복호화 함수
function decrypt(text: string): string {
  const textParts = text.split(':');
  const iv = Buffer.from(textParts.shift()!, 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

// 타입을 명시적으로 정의
interface AuthenticatedRequest extends Request {
  user?: { id: number };
}

// 입력 검증 미들웨어
export const validateProjectInput = [
  body('repositoryName').optional().notEmpty().withMessage('Repository name is required'),
  body('repositoryOwner').optional().notEmpty().withMessage('Repository owner is required'),
  body('title').optional().notEmpty().withMessage('Title is required'),
];

// 프로젝트 목록 조회
export const getProjectList = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  const { userId } = req.params;

  let sql = `
    SELECT 
      id,
      title,
      repository_name,
      repository_owner,
      creation_date
    FROM projects
    WHERE user_id = ?
  `;

  try {
    const [results]: any = await conn.promise().query(sql, [userId]);
    res.status(StatusCodes.OK).json(results);
  } catch (err) {
    next(err);
  }
};

// 프로젝트 상세 조회
export const getProject = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  const { projectId } = req.params;

  let sql = `
    SELECT 
      id,
      title,
      repository_name,
      repository_owner,
      creation_date,
      user_id
    FROM projects
    WHERE id = ?
  `;

  try {
    const [results]: any = await conn.promise().query(sql, [projectId]);
    if (results.length === 0) {
      res.status(StatusCodes.NOT_FOUND).json({ message: 'Project not found' });
      return;
    }
    res.status(StatusCodes.OK).json(results[0]);
  } catch (err) {
    next(err);
  }
};

// 프로젝트 생성
export const createProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(StatusCodes.BAD_REQUEST).json({ errors: errors.array() });
    return;
  }

  const { repositoryName, repositoryOwner, title } = req.body;
  const userId = 1; // 임시로 고정된 사용자 ID 사용

  let sql = `
    INSERT INTO projects (
      repository_name,
      repository_owner,
      title,
      creation_date,
      user_id
    ) VALUES (?, ?, ?, NOW(), ?)
  `;

  try {
    const [results]: any = await conn.promise().query(sql, [repositoryName, repositoryOwner, title, userId]);

    res.status(StatusCodes.CREATED).json({
      id: results.insertId,
      repositoryName,
      repositoryOwner,
      title,
      creationDate: new Date(),
      userId,
    });
  } catch (err) {
    console.error(err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'An error occurred while creating the project' });
  }
};

// 프로젝트 수정
export const updateProject = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(StatusCodes.BAD_REQUEST).json({ errors: errors.array() });
    return;
  }

  const { projectId } = req.params;
  const { repositoryName, repositoryOwner, gitToken, title } = req.body;

  let updateFields: string[] = [];
  let updateValues: any[] = [];

  if (repositoryName) {
    updateFields.push('repository_name = ?');
    updateValues.push(repositoryName);
  }
  if (repositoryOwner) {
    updateFields.push('repository_owner = ?');
    updateValues.push(repositoryOwner);
  }
  if (gitToken) {
    updateFields.push('git_token = ?');
    updateValues.push(encrypt(gitToken));
  }
  if (title) {
    updateFields.push('title = ?');
    updateValues.push(title);
  }

  if (updateFields.length === 0) {
    res.status(StatusCodes.BAD_REQUEST).json({ message: 'No fields to update' });
    return;
  }

  let sql = `UPDATE projects SET ${updateFields.join(', ')} WHERE id = ?`;
  updateValues.push(projectId);

  try {
    const [result]: any = await conn.promise().query(sql, updateValues);

    if (result.affectedRows === 0) {
      res.status(StatusCodes.NOT_FOUND).json({ message: 'Project not found' });
      return;
    }

    res.status(StatusCodes.OK).json({ message: 'Project updated successfully' });
  } catch (err) {
    next(err);
  }
};

// 프로젝트 삭제
export const deleteProject = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  const { projectId } = req.params;

  let sql = 'DELETE FROM projects WHERE id = ?';

  try {
    const [results]: any = await conn.promise().query(sql, [projectId]);
    if (results.affectedRows === 0) {
      res.status(StatusCodes.NOT_FOUND).json({ message: 'Project not found' });
      return;
    }
    res.status(StatusCodes.OK).json({ message: 'Project deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// 프로젝트 멤버 추가
export const addProjectMember = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  const { projectId } = req.params;
  const { userId } = req.body;

  let sql = 'INSERT INTO project_members (project_id, user_id) VALUES (?, ?)';

  try {
    await conn.promise().query(sql, [projectId, userId]);
    res.status(StatusCodes.CREATED).json({ message: 'Project member added successfully' });
  } catch (err) {
    next(err);
  }
};

// 프로젝트 멤버 조회
export const getMembersByProject = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  const { projectId } = req.params;

  let sql = `
    SELECT 
      pm.user_id AS member_id,  -- 멤버 아이디
      u.username,                -- 사용자 이름
      u.email                    -- 사용자 이메일
    FROM project_members pm
    JOIN users u ON pm.user_id = u.id
    WHERE pm.project_id = ?
  `;

  try {
    const [results]: any = await conn.promise().query(sql, [projectId]);
    res.status(StatusCodes.OK).json({
      projectId,
      members: results,
    });
  } catch (err) {
    next(err);
  }
};

// 프로젝트 멤버 삭제
export const removeProjectMember = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const { projectId, userId } = req.params;

  let sql = 'DELETE FROM project_members WHERE project_id = ? AND user_id = ?';

  try {
    const [results]: any = await conn.promise().query(sql, [projectId, userId]);
    if (results.affectedRows === 0) {
      res.status(StatusCodes.NOT_FOUND).json({ message: 'Project member not found' });
      return;
    }
    res.status(StatusCodes.OK).json({ message: 'Project member removed successfully' });
  } catch (err) {
    next(err);
  }
};

// 유저 별 프로젝트 조회
export const getProjectsByUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const { userId } = req.params;

  let sql = `
    SELECT 
      id AS project_id,
      title,
      repository_name,
      repository_owner,
      creation_date
    FROM projects
    WHERE user_id = ?
  `;

  try {
    const [results]: any = await conn.promise().query(sql, [userId]);
    res.status(StatusCodes.OK).json({
      projects: results,
    });
  } catch (err) {
    next(err);
  }
};

// 유저 별 멤버 조회
export const getMembersByUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  const { userId } = req.params;

  let sql = `
    SELECT 
      pm.user_id,    -- 멤버 ID
      p.id AS project_id,   -- 프로젝트 ID
      p.title,
      p.repository_name,
      p.repository_owner,
      p.creation_date
    FROM project_members pm
    JOIN projects p ON pm.project_id = p.id
    WHERE pm.user_id = ?
  `;

  try {
    const [results]: any = await conn.promise().query(sql, [userId]);
    res.status(StatusCodes.OK).json(results);
  } catch (err) {
    next(err);
  }
};

