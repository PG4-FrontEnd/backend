import express from 'express';
import {
  getProjectList,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  addProjectMember,
  removeProjectMember,
} from '../controllers/ProjectController';

const router = express.Router();

router.get('/user/:userId', getProjectList);
router.get('/:projectId', getProject);
router.post('/', createProject);
router.put('/:projectId', updateProject);
router.delete('/:projectId', deleteProject);
router.post('/:projectId/members', addProjectMember);
router.delete('/:projectId/members/:userId', removeProjectMember);

export default router;
