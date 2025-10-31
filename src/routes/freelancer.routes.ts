import express from 'express';
import { verifyToken } from '../middlewares/auth.middleware';
import { allowRoles } from '../middlewares/roleMiddleware';
import { createProfile } from '../controllers/freelancerProfileController';

const freelanceRoutes = express.Router();

// --Create freelancer profile--
freelanceRoutes.post(
  '/create-profile',
  verifyToken,
  allowRoles('freelancer'),
  createProfile
);

export default freelanceRoutes;
