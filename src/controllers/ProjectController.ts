import { Request, Response, NextFunction, RequestHandler } from 'express';
import { pool } from '../routes/Database';

export class ProjectController {
  getProjectIssues: RequestHandler = async (req, res, next) => {
    try {
      const [rows] = await pool.query('SELECT * FROM issues WHERE project_id = ?', [req.params.id]);
      res.json(rows);
    } catch (error) {
      next(error);
    }
  };

  addProjectMember: RequestHandler = async (req, res, next) => {
    try {
      // 프로젝트 멤버 추가 로직
      res.status(200).send('Member added');
    } catch (error) {
      next(error);
    }
  };

  removeProjectMember: RequestHandler = async (req, res, next) => {
    try {
      // 프로젝트 멤버 삭제 로직
      res.status(200).send('Member removed');
    } catch (error) {
      next(error);
    }
  };
}