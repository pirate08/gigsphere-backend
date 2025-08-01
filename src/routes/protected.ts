import express, { Request, Response } from 'express';
import { verifyToken } from '../middlewares/auth.middleware';

const protectedRoutes = express.Router();

protectedRoutes.get(
  '/dashboard',
  verifyToken,
  (req: Request, res: Response) => {
    res.json({
      message: 'Protected route accessed successfully!',
      user: req.user,
    });
  }
);

export default protectedRoutes;
