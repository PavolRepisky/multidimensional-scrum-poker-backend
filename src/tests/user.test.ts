import request from 'supertest';
import { app } from '../app';

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
      expect(response.statusCode).toBe(201);
    });

    it('response should have userId', async () => {
      const response = await request(app).put('/users/register').send({
        firstName: 'firstName',
        lastName: 'lastName',
        email: 'email@test2.com',
        password: 'passWord123$',
        confirmationPassword: 'passWord123$',
      });
      expect(response.body.userId).toBeDefined();
    });
  });

  describe('given an invalid firstName, lastname, email, password or confirmationPassword', () => {
    it('should respond with a 400 status code and a message: Validation failed', async () => {
      const response = await request(app).put('/users/register').send({
        firstName: 'firstName',
        lastName: 'lastName',
        email: 'email@test3.com',
        password: 'passWord123$',
        confirmationPassword: '',
      });
      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe('Validation failed');
    });
  });
});

describe('POST /users/login', () => {
  describe('given a valid email and password', () => {
    it('should respond with a 200 status code', async () => {
      await request(app).put('/users/register').send({
        firstName: 'firstName',
        lastName: 'lastName',
        email: 'email@test4.com',
        password: 'passWord123$',
        confirmationPassword: 'passWord123$',
      });

      const response = await request(app).post('/users/login').send({
        email: 'email@test4.com',
        password: 'passWord123$',
      });
      expect(response.statusCode).toBe(200);
    });

    it('response should have a token', async () => {
      const response = await request(app).post('/users/login').send({
        email: 'email@test4.com',
        password: 'passWord123$',
      });
      expect(response.body.token).toBeDefined();
    });
  });

  describe('given a invalid password', () => {
    it('should respond with a message: Wrong password', async () => {
      await request(app).put('/users/register').send({
        firstName: 'firstName',
        lastName: 'lastName',
        email: 'email@test5.com',
        password: 'passWord123$',
        confirmationPassword: 'passWord123$',
      });

      const response = await request(app).post('/users/login').send({
        email: 'email@test5.com',
        password: 'passWord',
      });
      expect(response.body.message).toBe('Wrong password');
    });
  });

  describe('given a non-existent email', () => {
    it('should respond with a message: User does not exist', async () => {
      const response = await request(app).post('/users/login').send({
        email: 'email',
        password: 'passWord123$',
      });
      expect(response.body.message).toBe('User does not exist');
    });
  });
});

describe('PATCH /users/password', () => {
  describe('authenticated and given a valid passwords', () => {
    it('should respond with a 200 status code and a message: Password changed successfully', async () => {
      await request(app).put('/users/register').send({
        firstName: 'firstName',
        lastName: 'lastName',
        email: 'email@test6.com',
        password: 'passWord123$',
        confirmationPassword: 'passWord123$',
      });

      const loginResponse = await request(app).post('/users/login').send({
        email: 'email@test5.com',
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
      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe('Password changed successfully');
    });
  });

  describe('not authenticated', () => {
    it('should respond with a 401 status code and a message: Unauthorized', async () => {
      const response = await request(app).patch('/users/password').send({
        password: 'passWord123$',
        newPassword: 'passWord1234$',
        confirmationPassword: 'passWord1234$',
      });
      expect(response.statusCode).toBe(401);
      expect(response.body.message).toBe('Unauthorized');
    });
  });

  describe('authenticated and given an invalid password', () => {
    it('should respond with a 400 status code and a message: Wrong password', async () => {
      await request(app).put('/users/register').send({
        firstName: 'firstName',
        lastName: 'lastName',
        email: 'email@test7.com',
        password: 'passWord123$',
        confirmationPassword: 'passWord123$',
      });

      const loginResponse = await request(app).post('/users/login').send({
        email: 'email@test7.com',
        password: 'passWord123$',
      });

      const response = await request(app)
        .patch('/users/password')
        .send({
          password: 'passWord$',
          newPassword: 'passWord1234$',
          confirmationPassword: 'passWord1234$',
        })
        .set('Authorization', 'Bearer ' + loginResponse.body.token);
      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe('Wrong password');
    });
  });
});
