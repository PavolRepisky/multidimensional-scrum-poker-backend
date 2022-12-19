import request from 'supertest';
import { app } from '../src/app';
import prisma from '../src/config/client';
import { HttpCode } from '../src/interfaces/httpCode';

const tokens: string[] = [];
const userIds: string[] = [];
const matrixIds: number[] = [];

/* Registers, logs in a new user, and stores its authentication token, before testing */
beforeAll(async () => {
  await request(app).put('/users/register').send({
    firstName: 'Matrix',
    lastName: 'Tester1',
    email: 'matrix@tester1.com',
    password: 'passWord123$',
    confirmationPassword: 'passWord123$',
  });

  const loginResponse = await request(app).post('/users/login').send({
    email: 'matrix@tester1.com',
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

  userIds.push(loginResponse.body.userId);
  tokens.push(loginResponse.body.token);
  matrixIds.push(matrixResponse.body.matrixId);

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

  userIds.push(loginResponse2.body.userId);
  tokens.push(loginResponse2.body.token);
});

/* Deletes created user and matrices from database after testing */
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
});

describe('POST /matrices', () => {
  describe('given a valid name, size, and values', () => {
    it('should respond with a 201 status code', async () => {
      const response = await request(app)
        .post('/matrices')
        .send({
          name: 'TestMatrix1',
          size: [2, 2],
          values: ['🙂', '😀', '😢', '🙃'],
        })
        .set('Authorization', 'Bearer ' + tokens[0]);

      matrixIds.push(response.body.matrixId);
      expect(response.statusCode).toBe(HttpCode.CREATED);
    });

    it('response should contain a matrix id', async () => {
      const response = await request(app)
        .post('/matrices')
        .send({
          name: 'TestMatrix2',
          size: [2, 2],
          values: ['🙂', '😀', '😢', '🙃'],
        })
        .set('Authorization', 'Bearer ' + tokens[0]);

      matrixIds.push(response.body.matrixId);
      expect(response.body.matrixId).toBeDefined();
    });
  });

  describe('given an existing name', () => {
    it('should respond with a 400 status code', async () => {
      const response = await request(app)
        .post('/matrices')
        .send({
          name: 'TestMatrix2',
          size: [2, 2],
          values: ['🙂', '😀', '😢', '🙃'],
        })
        .set('Authorization', 'Bearer ' + tokens[0]);
      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
    });
  });

  describe('given a non-matching sizes', () => {
    it('should respond with a 400 status code', async () => {
      const response = await request(app)
        .post('/matrices')
        .send({
          name: 'TestMatrix2',
          size: [3, 2],
          values: ['🙂', '😀', '😢', '🙃'],
        })
        .set('Authorization', 'Bearer ' + tokens[0]);
      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
    });
  });

  describe('given non-unique values', () => {
    it('should respond with a 400 status code', async () => {
      const response = await request(app)
        .post('/matrices')
        .send({
          name: 'TestMatrix3',
          size: [2, 2],
          values: ['🙂', '😀', '😀', '🙃'],
        })
        .set('Authorization', 'Bearer ' + tokens[0]);
      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
    });
  });
});

describe('GET /matrices', () => {
  describe('given authenticated user', () => {
    it('should respond with a 200 status code', async () => {
      const response = await request(app)
        .get('/matrices')
        .set('Authorization', 'Bearer ' + tokens[0]);

      expect(response.statusCode).toBe(HttpCode.OK);
    });

    it('response should contain a matrices array', async () => {
      const response = await request(app)
        .get('/matrices')
        .set('Authorization', 'Bearer ' + tokens[0]);

      expect(response.body.matrices).toBeInstanceOf(Array);
    });
  });
});

describe('GET /matrices/:id', () => {
  describe('given authenticated valid user', () => {
    it('should respond with a 200 status code', async () => {
      const response = await request(app)
        .get(`/matrices/:${matrixIds[0]}`)
        .set('Authorization', 'Bearer ' + tokens[0]);

      expect(response.statusCode).toBe(HttpCode.OK);
    });

    it('response should contain a matrix object', async () => {
      const response = await request(app)
        .get(`/matrices/:${matrixIds[0]}`)
        .set('Authorization', 'Bearer ' + tokens[0]);

      expect(response.body.matrix).toBeInstanceOf(Object);
    });
  });

  describe('given authenticated invalid user', () => {
    it('should respond with a 404 status code', async () => {
      const response = await request(app)
        .get(`/matrices/:${matrixIds[0]}`)
        .set('Authorization', 'Bearer ' + tokens[1]);

      expect(response.statusCode).toBe(HttpCode.NOT_FOUND);
    });
  });
});

describe('DELETE /matrices/:id', () => {
  describe('given authenticated valid user', () => {
    it('should respond with a 200 status code', async () => {
      const createResponse = await request(app)
        .post('/matrices')
        .send({
          name: 'TestMatrix4',
          size: [2, 2],
          values: ['🙂', '😀', '😢', '🙃'],
        })
        .set('Authorization', 'Bearer ' + tokens[0]);

      const response = await request(app)
        .delete(`/matrices/:${createResponse.body.matrixId}`)
        .set('Authorization', 'Bearer ' + tokens[0]);

      expect(response.statusCode).toBe(HttpCode.OK);
    });
  });

  describe('given authenticated invalid user', () => {
    it('should respond with a 404 status code', async () => {
      const response = await request(app)
        .delete(`/matrices/:${matrixIds[0]}`)
        .set('Authorization', 'Bearer ' + tokens[1]);

      expect(response.statusCode).toBe(HttpCode.NOT_FOUND);
    });
  });
});

describe('PATCH /matrices/:id', () => {
  describe('given a valid name, size, and values', () => {
    it('should respond with a 200 status code', async () => {
      const response = await request(app)
        .patch(`/matrices/:${matrixIds[0]}`)
        .send({
          name: 'TestMatrix5',
          size: [2, 2],
          values: ['🙂', '😀', '😢', '🙃'],
        })
        .set('Authorization', 'Bearer ' + tokens[0]);

      expect(response.statusCode).toBe(HttpCode.OK);
    });
  });

  describe('given an existing name', () => {
    it('should respond with a 400 status code', async () => {
      const response = await request(app)
        .patch(`/matrices/:${matrixIds[0]}`)
        .send({
          name: 'TestMatrix5',
          size: [2, 2],
          values: ['🙂', '😀', '😢', '🙃'],
        })
        .set('Authorization', 'Bearer ' + tokens[1]);

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
    });
  });

  describe('given a non-matching sizes', () => {
    it('should respond with a 400 status code', async () => {
      const response = await request(app)
        .patch(`/matrices/:${matrixIds[0]}`)
        .send({
          name: 'TestMatrix5',
          size: [2, 3],
          values: ['🙂', '😀', '😢', '🙃'],
        })
        .set('Authorization', 'Bearer ' + tokens[0]);
      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
    });
  });

  describe('given non-unique values', () => {
    it('should respond with a 400 status code', async () => {
      const response = await request(app)
        .patch(`/matrices/:${matrixIds[0]}`)
        .send({
          name: 'TestMatrix5',
          size: [2, 2],
          values: ['🙂', '😀', '😀', '🙃'],
        })
        .set('Authorization', 'Bearer ' + tokens[0]);
      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
    });
  });
});
