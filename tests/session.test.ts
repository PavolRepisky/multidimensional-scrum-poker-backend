import request from 'supertest';
import { app } from '../src/app';
import prisma from '../src/config/client';
import { HttpCode } from '../src/interfaces/httpCode';

const tokens: string[] = [];
const userIds: string[] = [];
const matrixIds: number[] = [];
const sessionHashes: string[] = [];

/* Registers, logs in a new user, and stores its authentication token, before testing */
beforeAll(async () => {
  await request(app).put('/users/register').send({
    firstName: 'Session',
    lastName: 'Tester1',
    email: 'session@tester1.com',
    password: 'passWord123$',
    confirmationPassword: 'passWord123$',
  });

  const loginResponse = await request(app).post('/users/login').send({
    email: 'session@tester1.com',
    password: 'passWord123$',
  });

  const matrixResponse = await request(app)
    .post('/matrices')
    .send({
      name: 'DefaultMatrix',
      size: [2, 2],
      values: ['👍', '👌', '👎', '👏'],
    })
    .set('Authorization', 'Bearer ' + loginResponse.body.token);

  const sessionResponse = await request(app)
    .post('/sessions')
    .send({
      name: 'DefaultSession',
      matrixId: matrixResponse.body.data.matrixId,
    })
    .set('Authorization', 'Bearer ' + loginResponse.body.token);

  userIds.push(loginResponse.body.data.userId);
  tokens.push(loginResponse.body.token);
  matrixIds.push(matrixResponse.body.data.matrixId);
  sessionHashes.push(sessionResponse.body.data.sessionHash);

  await request(app).put('/users/register').send({
    firstName: 'Matrix',
    lastName: 'Tester2',
    email: 'matrix@tester2.com',
    password: 'passWord123$',
    confirmationPassword: 'passWord123$',
  });

  const loginResponse2 = await request(app).post('/users/login').send({
    email: 'matrix@tester2.com',
    password: 'passWord123$',
  });

  const matrixResponse2 = await request(app)
    .post('/matrices')
    .send({
      name: 'DefaultMatrix2',
      size: [2, 2],
      values: ['👍', '👌', '👎', '👏'],
    })
    .set('Authorization', 'Bearer ' + loginResponse2.body.token);

  userIds.push(loginResponse2.body.data.userId);
  tokens.push(loginResponse2.body.token);
  matrixIds.push(matrixResponse2.body.data.matrixId);
});

/* Deletes created users and matrices from database after testing */
afterAll(async () => {
  await prisma.user.deleteMany({
    where: {
      id: {
        in: userIds,
      },
    },
  });

  await prisma.matrix.deleteMany({
    where: {
      id: {
        in: matrixIds,
      },
    },
  });

  await prisma.session.deleteMany({
    where: {
      hashId: {
        in: sessionHashes,
      },
    },
  });
});

describe('POST /sessions', () => {
  describe('given a valid matrix id and name', () => {
    it('should respond with a 201 status code', async () => {
      const response = await request(app)
        .post('/sessions')
        .send({
          name: 'Session1',
          matrixId: matrixIds[0],
        })
        .set('Authorization', 'Bearer ' + tokens[0]);

      sessionHashes.push(response.body.data.sessionHash);
      expect(response.statusCode).toBe(HttpCode.CREATED);
    });

    it('response should contain a session hash', async () => {
      const response = await request(app)
        .post('/sessions')
        .send({
          name: 'Session2',
          matrixId: matrixIds[0],
        })
        .set('Authorization', 'Bearer ' + tokens[0]);

      sessionHashes.push(response.body.data.sessionHash);
      expect(response.body.data.sessionHash).toBeDefined();
    });
  });

  describe('given no name', () => {
    it('should respond with a 400 status code', async () => {
      const response = await request(app)
        .post('/sessions')
        .send({
          matrixId: matrixIds[0],
        })
        .set('Authorization', 'Bearer ' + tokens[0]);
      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
    });
  });

  describe('given no matrix id', () => {
    it('should respond with a 400 status code', async () => {
      const response = await request(app)
        .post('/sessions')
        .send({
          name: 'Session',
        })
        .set('Authorization', 'Bearer ' + tokens[0]);
      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
    });
  });

  describe('given a non existing matrix id', () => {
    it('should respond with a 404 status code', async () => {
      const response = await request(app)
        .post('/sessions')
        .send({
          name: 'Session',
          matrixId: -10,
        })
        .set('Authorization', 'Bearer ' + tokens[0]);
      expect(response.statusCode).toBe(HttpCode.NOT_FOUND);
    });
  });

  describe('given an id of a matrix owned by another user', () => {
    it('should respond with a 404 status code', async () => {
      const response = await request(app)
        .post('/sessions')
        .send({
          name: 'Session',
          matrixId: matrixIds[1],
        })
        .set('Authorization', 'Bearer ' + tokens[0]);
      expect(response.statusCode).toBe(HttpCode.NOT_FOUND);
    });
  });
});

describe('GET /sessions/:sessionHash ', () => {
  describe('given a valid session hash', () => {
    it('should respond with a 200 status code', async () => {
      const joinResponse = await request(app).get(
        `/sessions/:${sessionHashes[0]}`
      );
      expect(joinResponse.statusCode).toBe(HttpCode.OK);
    });

    it('response should contain a session name and hash', async () => {
      const joinResponse = await request(app).get(
        `/sessions/:${sessionHashes[0]}`
      );

      expect(joinResponse.body.data.sessionName).toBeDefined();
      expect(joinResponse.body.data.sessionHash).toBeDefined();
    });
  });
});

describe('POST /sessions/:sessionHash/voting', () => {
  describe('given authenticated valid user and a name', () => {
    it('should respond with a 201 status code', async () => {
      const response = await request(app)
        .post(`/sessions/:${sessionHashes[0]}/voting`)
        .send({
          name: 'Voting1',
        })
        .set('Authorization', 'Bearer ' + tokens[0]);

      expect(response.statusCode).toBe(HttpCode.CREATED);
    });
  });

  describe('given no name', () => {
    it('should respond with a 400 status code', async () => {
      const response = await request(app)
        .post(`/sessions/:${sessionHashes[0]}/voting`)
        .send({})
        .set('Authorization', 'Bearer ' + tokens[0]);
      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
    });
  });

  describe('given a authenticated user, who is not the owner of the session', () => {
    it('should respond with a 404 status code', async () => {
      const response = await request(app)
        .post(`/sessions/:${sessionHashes[0]}/voting`)
        .send({
          name: 'Voting1',
        })
        .set('Authorization', 'Bearer ' + tokens[1]);
      expect(response.statusCode).toBe(HttpCode.NOT_FOUND);
    });
  });
});
