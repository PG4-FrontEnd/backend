import request from 'supertest';
   import express from 'express';
   import { IssueController } from '../controllers/IssueController';
   import { pool } from '../routes/Database';

   const app = express();
   app.use(express.json());

   const issueController = new IssueController();
   app.get('/issues/:projectId', issueController.getProjectIssues);
   app.post('/issues/:projectId', issueController.createIssue);
   app.put('/issues/:projectId', issueController.updateIssue);
   app.delete('/issues/:projectId', issueController.deleteIssue);

   beforeAll(async () => {
     // 테스트 데이터베이스 연결 및 초기 데이터 설정
   });

   afterAll(async () => {
     // 테스트 데이터베이스 연결 종료
     await pool.end();
   });

   describe('IssueController', () => {
     it('should get an issue', async () => {
       const res = await request(app).get('/issues/1?issueId=1');
       expect(res.status).toBe(200);
       expect(res.body).toHaveProperty('id');
     });

     it('should create an issue', async () => {
       const newIssue = {
         deadline: '2023-12-31',
         startDay: '2023-01-01',
         content: 'Test issue',
         manager: 'Test Manager',
         title: 'Test Title',
         tagId: 1,
         order: 1
       };
       const res = await request(app).post('/issues/1').send(newIssue);
       expect(res.status).toBe(201);
       expect(res.body).toHaveProperty('id');
     });

     it('should update an issue', async () => {
       const updatedIssue = {
         deadline: '2023-12-31',
         startDay: '2023-01-01',
         content: 'Updated Test issue',
         manager: 'Updated Test Manager',
         title: 'Updated Test Title',
         tagId: 2,
         order: 2
       };
       const res = await request(app).put('/issues/1?issueId=1').send(updatedIssue);
       expect(res.status).toBe(200);
       expect(res.body.content).toBe('Updated Test issue');
     });

     it('should delete an issue', async () => {
       const res = await request(app).delete('/issues/1?issueId=1');
       expect(res.status).toBe(200);
     });
   });