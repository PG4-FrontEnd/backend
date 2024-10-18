import conn from '../../config/mariadb';
import { StatusCodes } from 'http-status-codes';

// 이슈 목록 조회
const getIssueList = (req, res) => {
  const { projectId } = req.params;

  // 회원가입 시 비밀번호를 암호화해서 암호화된 비밀번호와 salt 값을 같이 저장
  let values = [projectId];
  //   let sql = 'INSERT INTO users (personal_id, name, email, password, salt) VALUES (?, ?, ?, ?, ?)';
  let sql = `
    select
        id,
        expired,
        create_at,
        updated_at,
        startDay,
        content,
        manager,
        title,
        tag_id,
        project_id,
        ordering
    from issue
    where project_id = ?
    `;

  conn.query(sql, values, (err, results) => {
    if (err) {
      console.log(err);
      return res.status(StatusCodes.BAD_REQUEST).end(); // BAD REQUEST
    }

    return res.status(StatusCodes.OK).json(results);
  });
};

// 이슈 상세 조회
const getIssue = (req, res) => {
  const { issueId } = req.params;

  // 회원가입 시 비밀번호를 암호화해서 암호화된 비밀번호와 salt 값을 같이 저장
  let values = [issueId];
  //   let sql = 'INSERT INTO users (personal_id, name, email, password, salt) VALUES (?, ?, ?, ?, ?)';
  let sql = `
    select 
        expired,
        create_at,
        updated_at,
        startDay,
        content,
        manager,
        title,
        tag_id,
        project_id,
        ordering
    from issue
    where id = ?
    `;

  conn.query(sql, values, (err, results) => {
    if (err) {
      console.log(err);
      return res.status(StatusCodes.BAD_REQUEST).end(); // BAD REQUEST
    }

    return res.status(StatusCodes.OK).json(results[0]);
  });
};

// 이슈 생성
const addIssue = (req, res) => {
  const { projectId } = req.params;
  const { expired, startDay, content, manager, title, ordering, tag_id } = req.body;
  let values = [expired, startDay, content, manager, title, tag_id, projectId, ordering];

  let sql = `
    insert into issue (
        expired,
        create_at,
        updated_at,
        startDay,
        content,
        manager,
        title,
        tag_id,
        project_id,
        ordering
    ) values (?, now(), now(), ?, ?, ?, ?, ?, ?, ?)
    `;
  conn.query(sql, values, (err, results) => {
    if (err) {
      console.log(err);
      return res.status(StatusCodes.BAD_REQUEST).end(); // BAD REQUEST
    }

    return res.status(StatusCodes.CREATED).json(results);
  });
};

// 이슈 수정
const updateIssue = (req, res) => {
  const { issueId } = req.params;
  const { expired, startDay, content, manager, title, ordering, tag_id } = req.body;

  let values = [expired, startDay, content, manager, title, tag_id, ordering, issueId];
  let sql = `
        update issue
        set
            expired = ?,
            updated_at = now(),
            startDay = ?,
            content = ?,
            manager = ?,
            title = ?,
            tag_id = ?,
            ordering = ?
        where id = ?
    `;
  conn.query(sql, values, (err, results) => {
    if (err) {
      console.log(err);
      return res.status(StatusCodes.BAD_REQUEST).end(); // BAD REQUEST
    }

    return res.status(StatusCodes.CREATED).json(results);
  });
};

// 이슈 삭제
const deleteIssue = (req, res) => {
  const { issueId } = req.params;

  let sql = 'delete from issue where id = ?';
  conn.query(sql, issueId, (err, results) => {
    if (err) {
      console.log(err);
      return res.status(StatusCodes.BAD_REQUEST).end(); // BAD REQUEST
    }

    return res.status(StatusCodes.CREATED).json(results);
  });
};

export { getIssueList, getIssue, addIssue, updateIssue, deleteIssue };
