import express from 'express';
import { body } from 'express-validator';
import prisma from '../config/client';
import userController from '../controllers/user';
import { isAuthenticated } from '../middleware/isAuthenticated';

const router = express.Router();

router.put(
  '/register',
  [
    body('firstName')
      .trim()
      .exists({ checkFalsy: true })
      .withMessage('First name is required'),

    body('lastName')
      .trim()
      .exists({ checkFalsy: true })
      .withMessage('Last name is required'),

    body('email')
      .trim()
      .isEmail()
      .withMessage('Invalid email address')
      .custom((value: string) => {
        return prisma.user
          .findUnique({
            where: {
              email: value,
            },
          })
          .then((user) => {
            if (user) {
              return Promise.reject('Email address already exists');
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
        'Password must be at least 8 characters long and it must contain an uppercase character, a number and a symbol'
      ),

    body('confirmationPassword')
      .custom(
        (value: string, { req }: { req: any }) => value === req.body.password
      )
      .withMessage('Passwords do not match'),
  ],
  userController.register
);

router.post('/login', userController.login);

router.patch(
  '/password',
  isAuthenticated,
  body('password')
    .exists({ checkFalsy: true })
    .withMessage('Password is required'),

  body('newPassword')
    .trim()
    .isStrongPassword({
      minLength: 8,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    })
    .withMessage(
      'Password must be at least 8 characters long and it must contain an uppercase character, a number and a symbol'
    ),

  body('confirmationPassword')
    .custom(
      (value: string, { req }: { req: any }) => value === req.body.newPassword
    )
    .withMessage('Passwords do not match'),
  userController.changePassword
);

export default router;
