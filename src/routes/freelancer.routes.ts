import express from 'express';
import { verifyToken } from '../middlewares/auth.middleware';
import { allowRoles } from '../middlewares/roleMiddleware';
import {
  createProfile,
  getDashboardStats,
  getProfileDetails,
  updateProfileDetails,
} from '../controllers/freelancerProfileController';
import { browseJobs } from '../controllers/browseJobController';

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

// -- Fetch dashboard details--
freelanceRoutes.get(
  '/dashboard',
  verifyToken,
  allowRoles('freelancer'),
  getDashboardStats
);

// -- Fetch all jobs based on filters, search, and pagination --
freelanceRoutes.get('/jobs', verifyToken, allowRoles('freelancer'), browseJobs);

export default freelanceRoutes;
