import express from 'express';
import { verifyToken } from '../middlewares/auth.middleware';
import { allowRoles } from '../middlewares/roleMiddleware';
import {
  createProfile,
  getDashboardStats,
  getProfileDetails,
  updateProfileDetails,
} from '../controllers/freelancerProfileController';
import {
  applyToAJob,
  browseJobs,
  getSingleJobdetails,
} from '../controllers/browseJobController';
import {
  getNotifications,
  markAsRead,
} from '../controllers/notificationController';
import { changePassword } from '../controllers/settingsController';

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

// --Fetch single job details--
freelanceRoutes.get(
  '/jobs/:jobId',
  verifyToken,
  allowRoles('freelancer'),
  getSingleJobdetails
);

// --Apply to a job--
freelanceRoutes.post(
  '/jobs/apply',
  verifyToken,
  allowRoles('freelancer'),
  applyToAJob
);

// --Fetch Notification--
freelanceRoutes.get(
  '/notifications',
  verifyToken,
  allowRoles('freelancer'),
  getNotifications
);

// --Mark As Read Notification--
freelanceRoutes.patch(
  '/read/:notificationId',
  verifyToken,
  allowRoles('freelancer'),
  markAsRead
);

// --Change Password--
freelanceRoutes.patch(
  '/profile/password',
  verifyToken,
  allowRoles('freelancer'),
  changePassword
);

export default freelanceRoutes;
