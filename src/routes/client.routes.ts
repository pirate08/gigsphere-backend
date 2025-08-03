import express, { Request, Response } from 'express';
import { verifyToken } from '../middlewares/auth.middleware';
import { allowRoles } from '../middlewares/roleMiddleware';
import { getMyJobs } from '../controllers/clientController';

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

clientRoutes.get('/my-jobs', verifyToken, allowRoles('client'), getMyJobs);

export default clientRoutes;
