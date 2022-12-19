import express from 'express';
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
    body('size')
      .exists({ checkFalsy: true })
      .withMessage('Size is required')
      .isArray({ min: 2, max: 2 })
      .withMessage('Size must be an array of size 2'),
    body('values')
      .exists({ checkFalsy: true })
      .withMessage('Values are required')
      .isArray()
      .withMessage('Values must be an array'),
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
    body('size')
      .exists({ checkFalsy: true })
      .withMessage('Size is required')
      .isArray({ min: 2, max: 2 })
      .withMessage('Size must be an array of size 2'),
    body('values')
      .exists({ checkFalsy: true })
      .withMessage('Values are required')
      .isArray()
      .withMessage('Values must be an array'),
  ],
  matrixController.edit
);

router.get('/', isAuthenticated, matrixController.list);

router.get('/::id', isAuthenticated, matrixController.view);

router.delete('/::id', isAuthenticated, matrixController.remove);

export default router;
