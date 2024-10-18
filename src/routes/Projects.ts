import express from 'express';
import { ProjectController } from '../controllers/ProjectController';

const router = express.Router();
const projectController = new ProjectController();

router.get('/:id', projectController.getProjectIssues);
router.post('/:id/members', projectController.addProjectMember);
router.delete('/:id/members', projectController.removeProjectMember);

export default router;
