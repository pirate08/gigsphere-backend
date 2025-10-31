import express from 'express';
import { verifyToken } from '../middlewares/auth.middleware';
import { allowRoles } from '../middlewares/roleMiddleware';
import {
  createProfile,
  getProfileDetails,
  updateProfileDetails,
} from '../controllers/freelancerProfileController';

const freelanceRoutes = express.Router();

// --Create freelancer profile--
freelanceRoutes.post(
  '/create-profile',
  verifyToken,
  allowRoles('freelancer'),
  createProfile
);

// --Fetch profile details (name, email, description etc.)
freelanceRoutes.get(
  '/profile',
  verifyToken,
  allowRoles('freelancer'),
  getProfileDetails
);

// --Update profile details--
freelanceRoutes.patch(
  '/update-profile',
  verifyToken,
  allowRoles('freelancer'),
  updateProfileDetails
);

export default freelanceRoutes;
