import express from 'express';
import {
  getProjectList,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  addProjectMember,
  removeProjectMember,
  validateProjectInput,
  getProjectsByUser, // 유저 별 프로젝트 조회
  getMembersByUser, // 유저 별 멤버 조회
  getMembersByProject, // 프로젝트 별 멤버 조회 추가
} from '../controllers/ProjectController';

const router = express.Router();

router.get('/users/:userId', getProjectList); // 프로젝트 목록 조회: localhost:3018/api/projects/users/1
router.get('/:projectId', getProject); // 특정 프로젝트 조회: localhost:3018/api/projects/3
router.post('/', validateProjectInput, createProject); // 새 프로젝트 생성: localhost:3018/api/projects
router.put('/:projectId', validateProjectInput, updateProject); // 프로젝트 정보 수정: localhost:3018/api/projects/3
router.delete('/:projectId', deleteProject); // 프로젝트 삭제: localhost:3018/api/projects/3
router.post('/:projectId/members', addProjectMember); // 프로젝트 멤버 추가: localhost:3018/api/projects/3/members
router.delete('/:projectId/members/:userId', removeProjectMember); // 프로젝트 멤버 삭제: localhost:3018/api/projects/3/members/2
router.get('/users/:userId/projects', getProjectsByUser); // 유저 별 프로젝트 조회: localhost:3018/api/projects/users/1/projects
router.get('/users/:userId/members', getMembersByUser); // 유저 별 멤버 조회: localhost:3018/api/projects/users/1/members
router.get('/:projectId/members', getMembersByProject); // 프로젝트 별 멤버 조회: localhost:3018/api/projects/3/members


export default router;
