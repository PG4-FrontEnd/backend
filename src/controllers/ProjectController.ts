import conn from '../../config/mariadb';
import { StatusCodes } from 'http-status-codes';
import { Request, Response } from 'express';

// 프로젝트 목록 조회
export const getProjectList = (req: Request, res: Response) => {
  const { userId } = req.params;

  let sql = `
    SELECT 
      id,
      title,
      git_repository,
      representative_image,
      creation_date
    FROM projects
    WHERE user_id = ?
  `;

  conn.query(sql, [userId], (err, results) => {
    if (err) {
      console.log(err);
      return res.status(StatusCodes.BAD_REQUEST).end();
    }
    return res.status(StatusCodes.OK).json(results);
  });
};

// 프로젝트 상세 조회
export const getProject = (req: Request, res: Response) => {
  const { projectId } = req.params;

  let sql = `
    SELECT 
      id,
      title,
      git_repository,
      representative_image,
      creation_date,
      user_id
    FROM projects
    WHERE id = ?
  `;

  conn.query(sql, [projectId], (err, results) => {
    if (err) {
      console.log(err);
      return res.status(StatusCodes.BAD_REQUEST).end();
    }
    return res.status(StatusCodes.OK).json(results[0]);
  });
};

// 프로젝트 생성
export const createProject = (req: Request, res: Response) => {
  const { title, gitRepository, representativeImage, userId } = req.body;

  let sql = `
    INSERT INTO projects (
      title,
      git_repository,
      representative_image,
      creation_date,
      user_id
    ) VALUES (?, ?, ?, NOW(), ?)
  `;

  conn.query(sql, [title, gitRepository, representativeImage, userId], (err, results) => {
    if (err) {
      console.log(err);
      return res.status(StatusCodes.BAD_REQUEST).end();
    }
    return res.status(StatusCodes.CREATED).json(results);
  });
};

// 프로젝트 수정
export const updateProject = (req: Request, res: Response) => {
  const { projectId } = req.params;
  const { title, gitRepository, representativeImage } = req.body;

  let sql = `
    UPDATE projects
    SET 
      title = ?,
      git_repository = ?,
      representative_image = ?
    WHERE id = ?
  `;

  conn.query(sql, [title, gitRepository, representativeImage, projectId], (err, results) => {
    if (err) {
      console.log(err);
      return res.status(StatusCodes.BAD_REQUEST).end();
    }
    return res.status(StatusCodes.OK).json(results);
  });
};

// 프로젝트 삭제
export const deleteProject = (req: Request, res: Response) => {
  const { projectId } = req.params;

  let sql = 'DELETE FROM projects WHERE id = ?';

  conn.query(sql, [projectId], (err, results) => {
    if (err) {
      console.log(err);
      return res.status(StatusCodes.BAD_REQUEST).end();
    }
    return res.status(StatusCodes.OK).json(results);
  });
};

// 프로젝트 멤버 추가
export const addProjectMember = (req: Request, res: Response) => {
  const { projectId } = req.params;
  const { userId } = req.body;

  let sql = 'INSERT INTO project_members (project_id, user_id) VALUES (?, ?)';

  conn.query(sql, [projectId, userId], (err, results) => {
    if (err) {
      console.log(err);
      return res.status(StatusCodes.BAD_REQUEST).end();
    }
    return res.status(StatusCodes.CREATED).json(results);
  });
};

// 프로젝트 멤버 삭제
export const removeProjectMember = (req: Request, res: Response) => {
  const { projectId, userId } = req.params;

  let sql = 'DELETE FROM project_members WHERE project_id = ? AND user_id = ?';

  conn.query(sql, [projectId, userId], (err, results) => {
    if (err) {
      console.log(err);
      return res.status(StatusCodes.BAD_REQUEST).end();
    }
    return res.status(StatusCodes.OK).json(results);
  });
};
