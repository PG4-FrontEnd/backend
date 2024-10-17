import { Router, json } from 'express';
import { addIssue, deleteIssue, getIssue, getIssueList, updateIssue } from '../controllers/IssueController';

const router: Router = Router();

router.use(json());

router.get('/:projectId', getIssueList); // 이슈 리스트  --> http://localhost:3000/issues GET
router.get('/:projectId/:issueId', getIssue); // 이슈 상세 --> http://localhost:3000/1 GET
router.post('/:projectId', addIssue); // 이슈 추가 -> http://localhost:3000 POST
router.put('/:projectId/:issueId', updateIssue); // 이슈 수정 -> http://localhost:3000/1 put
router.delete('/:projectId/:issueId', deleteIssue); // 이슈 추가 --> http://localhost:3000/issues/1 DELETE

export default router;
