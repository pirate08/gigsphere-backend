import express from 'express';
import { verifyToken } from '../middlewares/auth.middleware';
import { allowRoles } from '../middlewares/roleMiddleware';

const freelanceRoutes = express.Router();
