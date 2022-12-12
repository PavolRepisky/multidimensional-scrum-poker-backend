import express from 'express';
import { body } from 'express-validator';
import prisma from '../config/client';
import userController from '../controllers/user';
import { authenticate } from '../middleware/authenticate';

const router = express.Router();

router.put(
  '/register',
  [
    body('firstName')
      .trim()
      .exists({ checkFalsy: true })
      .withMessage('first name is required'),

    body('lastName')
      .trim()
      .exists({ checkFalsy: true })
      .withMessage('last name is required'),

    body('email')
      .trim()
      .isEmail()
      .withMessage('invalid email address')
      .custom((value: string) => {
        return prisma.user
          .findUnique({
            where: {
              email: value,
            },
          })
          .then((user) => {
            if (user) {
              return Promise.reject('email address already exists');
            }
          });
      })
      .normalizeEmail(),

    body('password')
      .trim()
      .isStrongPassword({
        minLength: 8,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage(
        'your password should be at least 8 characters long and it should contain an uppercase character, a number and a symbol'
      ),

    body('confirmationPassword')
      .custom(
        (value: string, { req }: { req: any }) => value === req.body.password
      )
      .withMessage('the passwords should match'),
  ],
  userController.register
);

router.post('/login', userController.login);

router.patch(
  '/password',
  authenticate,
  body('password')
    .exists({ checkFalsy: true })
    .withMessage('password is required'),

  body('newPassword')
    .trim()
    .isStrongPassword({
      minLength: 8,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    })
    .withMessage(
      'your password should be at least 8 characters long and it should contain an uppercase character, a number and a symbol'
    ),

  body('confirmationPassword')
    .custom(
      (value: string, { req }: { req: any }) => value === req.body.newPassword
    )
    .withMessage('the passwords should match'),
  userController.changePassword
);

export default router;
