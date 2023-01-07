import request from 'supertest';
import { app } from '../src/app';
import prisma from '../src/config/client';
import { HttpCode } from '../src/interfaces/httpCode';

const user = {email: 'user@tester1.com', password: 'passWord123$', token: ''};
const userIds: string[] = [];

/* Registers, logs in a new user, and stores its authentication token, before testing */
beforeAll(async () => {
  await request(app).put('/users/register').send({
    firstName: 'User',
    lastName: 'Tester1',
    email: 'user@tester1.com',
    password: 'passWord123$',
    confirmationPassword: 'passWord123$',
  });

  const loginResponse = await request(app).post('/users/login').send({
    email: 'user@tester1.com',
    password: 'passWord123$',
  });

  userIds.push(loginResponse.body.data.userId);
  user.token = loginResponse.body.token;
});

/* Deletes created user from database after testing */
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
  describe('given a valid firstName, lastname, email, password and confirmationPassword', () => {
    it('should respond with a 201 status code', async () => {
      const response = await request(app).put('/users/register').send({
        firstName: 'firstName',
        lastName: 'lastName',
        email: 'email@test.com',
        password: 'passWord123$',
        confirmationPassword: 'passWord123$',
      });
      userIds.push(response.body.data.userId);
      expect(response.statusCode).toBe(HttpCode.CREATED);
    });

    it('response should have userId', async () => {
      const response = await request(app).put('/users/register').send({
        firstName: 'firstName',
        lastName: 'lastName',
        email: 'email@test2.com',
        password: 'passWord123$',
        confirmationPassword: 'passWord123$',
      });
      userIds.push(response.body.data.userId);
      expect(response.body.data.userId).toBeDefined();
    });
  });

  describe('given an invalid firstName, lastname, email, password or confirmationPassword', () => {
    it('should respond with a 400 status code', async () => {
      const response = await request(app).put('/users/register').send({
        firstName: 'firstName',
        lastName: 'lastName',
        email: 'email@test3.com',
        password: 'passWord123$',
        confirmationPassword: '',
      });
      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
    });
  });
});

describe('POST /users/login', () => {
  describe('given a valid email and password', () => {
    it('should respond with a 200 status code', async () => {
      const response = await request(app).post('/users/login').send({
        email: user.email,
        password: user.password,
      });
      expect(response.statusCode).toBe(HttpCode.OK);
    });

    it('response should have a token', async () => {
      const response = await request(app).post('/users/login').send({
        email: user.email,
        password: user.password,
      });
      expect(response.body.token).toBeDefined();
    });
  });

  describe('given a invalid password', () => {
    it('should respond with 401 status code', async () => {
      const response = await request(app).post('/users/login').send({
        email: user.email,
        password: 'passWord',
      });
      expect(response.statusCode).toBe(HttpCode.UNAUTHORIZED);
    });
  });

  describe('given a non-existent email', () => {
    it('should respond with 405 status code', async () => {
      const response = await request(app).post('/users/login').send({
        email: 'email',
        password: user.password,
      });
      expect(response.statusCode).toBe(HttpCode.NOT_FOUND);
    });
  });
});

describe('PATCH /users/password', () => {
  describe('authenticated and given a valid passwords', () => {
    it('should respond with a 200 status code', async () => {
      const response = await request(app)
        .patch('/users/password')
        .send({
          password: user.password,
          newPassword: 'passWord1234$',
          confirmationPassword: 'passWord1234$',
        })
        .set('Authorization', 'Bearer ' + user.token);

      user.password = 'passWord1234$';
      expect(response.statusCode).toBe(HttpCode.OK);
    });
  });

  describe('not authenticated', () => {
    it('should respond with a 401 status code', async () => {
      const response = await request(app).patch('/users/password').send({
        password: user.password,
        newPassword: 'passWord1234$',
        confirmationPassword: 'passWord1234$',
      });
      expect(response.statusCode).toBe(HttpCode.UNAUTHORIZED);
    });
  });

  describe('authenticated and given an invalid password', () => {
    it('should respond with a 400 status code', async () => {
      const response = await request(app)
        .patch('/users/password')
        .send({
          password: 'wrongPassword',
          newPassword: 'passWord1234$',
          confirmationPassword: 'passWord1234$',
        })
        .set('Authorization', 'Bearer ' + user.token);
      expect(response.statusCode).toBe(HttpCode.UNAUTHORIZED);
    });
  });
});
