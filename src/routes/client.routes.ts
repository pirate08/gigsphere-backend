import express, { Request, Response } from 'express';
import { verifyToken } from '../middlewares/auth.middleware';
import { allowRoles } from '../middlewares/roleMiddleware';

const clientRoutes = express.Router();

clientRoutes.post(
  '/jobs',
  verifyToken,
  allowRoles('client'),
  (req: Request, res: Response) => {
    return res.json({
      message: 'Job created successfully by client!',
      user: req.user,
    });
  }
);


export default clientRoutes;