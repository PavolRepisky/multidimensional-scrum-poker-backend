import express, { NextFunction, Request, Response } from 'express';
import { body } from 'express-validator';
import prisma from '../config/client';
import matrixController from '../controllers/matrix';
import { isAuthenticated } from '../middleware/isAuthenticated';

const router = express.Router();

router.post(
  '/',
  [
    isAuthenticated,
    body('name')
      .trim()
      .exists({ checkFalsy: true })
      .withMessage('Name is required')
      .custom((value: string) => {
        return prisma.matrix
          .findUnique({
            where: {
              name: value,
            },
          })
          .then((matrix: any) => {
            if (matrix) {
              return Promise.reject('The name is already in use');
            }
          });
      }),
    body('values')
      .exists({ checkFalsy: true })
      .withMessage('Values are required')
      .isArray()
      .withMessage('Values must be an array')
      .custom(
        (values: string, { req }: { req: any }) =>
          new Set(values).size === values.length
      )
      .withMessage('Values must be unique'),
    body('size')
      .exists({ checkFalsy: true })
      .withMessage('Size is required')
      .isArray({ min: 2, max: 2 })
      .withMessage('Size must be an array of size 2')
      .custom(
        (size: Array<number>, { req }: { req: any }) =>
          size[0] * size[1] === req.body.values.length
      )
      .withMessage('Sizes do not match'),
  ],
  matrixController.create
);

router.patch(
  '/::id',
  [
    isAuthenticated,
    body('name')
      .trim()
      .exists({ checkFalsy: true })
      .withMessage('Name is required')
      .custom((value: string) => {
        return prisma.matrix
          .findUnique({
            where: {
              name: value,
            },
          })
          .then((matrix: any) => {
            if (matrix) {
              return Promise.reject('The name is already in use');
            }
          });
      }),
    body('values')
      .exists({ checkFalsy: true })
      .withMessage('Values are required')
      .isArray()
      .withMessage('Values must be an array')
      .custom(
        (values: string, { req }: { req: any }) =>
          new Set(values).size === values.length
      )
      .withMessage('Values must be unique'),
    body('size')
      .exists({ checkFalsy: true })
      .withMessage('Size is required')
      .isArray({ min: 2, max: 2 })
      .withMessage('Size must be an array of size 2')
      .custom(
        (size: Array<number>, { req }: { req: any }) =>
          size[0] * size[1] === req.body.values.length
      )
      .withMessage('Sizes do not match'),
  ],
  matrixController.edit
);

router.get('/', isAuthenticated, matrixController.list);

router.get('/::id', isAuthenticated, matrixController.view);

router.delete('/::id', isAuthenticated, matrixController.remove);

export default router;
