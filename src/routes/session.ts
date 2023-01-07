import express from 'express';
import { body } from 'express-validator';
import sessionController from '../controllers/session';
import { isAuthenticated } from '../middleware/isAuthenticated';
const router = express.Router();

router.post(
  '/',
  [
    isAuthenticated,

    body('name')
      .trim()
      .exists({ checkFalsy: true })
      .withMessage('Session name is required'),

    body('matrixId')
      .exists({ checkFalsy: true })
      .withMessage('Matrix id is required')
      .isInt()
      .withMessage('Matrix id must be an integer'),
  ],
  sessionController.create
);

router.get('/::hashId', sessionController.join);

router.post(
  '/::hashId/voting',
  [
    isAuthenticated,
    body('name')
      .trim()
      .exists({ checkFalsy: true })
      .withMessage('Voting name is required'),
  ],
  sessionController.createVoting
);

export default router;
