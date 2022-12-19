import request from 'supertest';
import { app } from '../src/app';
import prisma from '../src/config/client';
import { HttpCode } from '../src/interfaces/httpCode';

const userIds: string[] = [];

/* Registers, logs in a new user, and stores its authentication token, before testing */
beforeAll(async () => {
  await request(app).put('/users/register').send({
    firstName: 'Test',
    lastName: 'User',
    email: 'test@user.com',
    password: 'passWord123$',
    confirmationPassword: 'passWord123$',
  });

  const loginResponse = await request(app).post('/users/login').send({
    email: 'test@user.com',
    password: 'passWord123$',
  });

  userIds.push(loginResponse.body.userId);
});

/* Deletes created users from database after testing */
afterAll(async () => {
  await prisma.user.deleteMany({
    where: {
      id: {
        in: userIds,
      },
    },
  });
});

describe('PUT /users/register', () => {
  describe('given a valid first name, last name, email, password and confirmation password', () => {
    it('should respond with a 201 status code', async () => {
      const response = await request(app).put('/users/register').send({
        firstName: 'Test',
        lastName: 'User2',
        email: 'test@user2.com',
        password: 'passWord123$',
        confirmationPassword: 'passWord123$',
      });

      userIds.push(response.body.userId);
      expect(response.statusCode).toBe(HttpCode.CREATED);
    });

    it('response should contain a user id', async () => {
      const response = await request(app).put('/users/register').send({
        firstName: 'Test',
        lastName: 'User3',
        email: 'test@user3.com',
        password: 'passWord123$',
        confirmationPassword: 'passWord123$',
      });

      userIds.push(response.body.userId);
      expect(response.body.userId).toBeDefined();
    });
  });

  describe('given an invalid first name, last name, email, password and confirmation password', () => {
    it('should respond with a 400 status code', async () => {
      const response = await request(app).put('/users/register').send({
        firstName: 'Test',
        lastName: 'User4',
        email: 'test@user4.com',
        password: 'passWord123$',
        confirmationPassword: 'pass',
      });
      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
    });
  });
});

describe('POST /users/login', () => {
  describe('given a valid email and password', () => {
    it('should respond with a 200 status code', async () => {
      const response = await request(app).post('/users/login').send({
        email: 'test@user.com',
        password: 'passWord123$',
      });
      expect(response.statusCode).toBe(HttpCode.OK);
    });

    it('response should contain a user token', async () => {
      const response = await request(app).post('/users/login').send({
        email: 'test@user.com',
        password: 'passWord123$',
      });
      expect(response.body.token).toBeDefined();
    });
  });

  describe('given an invalid password', () => {
    it('should respond with 401 status code', async () => {
      const response = await request(app).post('/users/login').send({
        email: 'test@user.com',
        password: 'wrongPassword',
      });
      expect(response.statusCode).toBe(HttpCode.UNAUTHORIZED);
    });
  });

  describe('given a non-existent email', () => {
    it('should respond with 405 status code', async () => {
      const response = await request(app).post('/users/login').send({
        email: 'wrong@email.com',
        password: 'passWord123$',
      });
      expect(response.statusCode).toBe(HttpCode.NOT_FOUND);
    });
  });
});

describe('PATCH /users/password', () => {
  describe('authenticated and given a valid passwords', () => {
    it('should respond with a 200 status code', async () => {
      await request(app).put('/users/register').send({
        firstName: 'Test',
        lastName: 'User5',
        email: 'test@user5.com',
        password: 'passWord123$',
        confirmationPassword: 'passWord123$',
      });

      const loginResponse = await request(app).post('/users/login').send({
        email: 'test@user5.com',
        password: 'passWord123$',
      });

      const response = await request(app)
        .patch('/users/password')
        .send({
          password: 'passWord123$',
          newPassword: 'passWord1234$',
          confirmationPassword: 'passWord1234$',
        })
        .set('Authorization', 'Bearer ' + loginResponse.body.token);

      userIds.push(loginResponse.body.userId);
      expect(response.statusCode).toBe(HttpCode.OK);
    });
  });

  describe('not authenticated', () => {
    it('should respond with a 401 status code', async () => {
      const response = await request(app).patch('/users/password').send({
        password: 'passWord123$',
        newPassword: 'passWord1234$',
        confirmationPassword: 'passWord1234$',
      });
      expect(response.statusCode).toBe(HttpCode.UNAUTHORIZED);
    });
  });

  describe('authenticated and given an invalid password', () => {
    it('should respond with a 400 status code', async () => {
      await request(app).put('/users/register').send({
        firstName: 'Test',
        lastName: 'User6',
        email: 'test@user6.com',
        password: 'passWord123$',
        confirmationPassword: 'passWord123$',
      });

      const loginResponse = await request(app).post('/users/login').send({
        email: 'test@user6.com',
        password: 'passWord123$',
      });

      const response = await request(app)
        .patch('/users/password')
        .send({
          password: 'wrongPassword',
          newPassword: 'passWord1234$',
          confirmationPassword: 'passWord1234$',
        })
        .set('Authorization', 'Bearer ' + loginResponse.body.token);

      userIds.push(loginResponse.body.userId);
      expect(response.statusCode).toBe(HttpCode.UNAUTHORIZED);
    });
  });
});
