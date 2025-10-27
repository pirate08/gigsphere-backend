import express from 'express';
import { verifyToken } from '../middlewares/auth.middleware';
import { allowRoles } from '../middlewares/roleMiddleware';
import {
  createJob,
  deleteAJob,
  getDataById,
  getMyJobs,
  updateJob,
} from '../controllers/clientController';
import {
  acceptOrRejectApplicant,
  getApplicationByJob,
  viewAllApplicants,
} from '../controllers/applicationController';
import { searchFreelancers } from '../controllers/searchController';
import {
  getProfileData,
  updateProfileDetails,
} from '../controllers/profileController';

const clientRoutes = express.Router();

// --Get Profile Data and Job Statistics (Total, Open, Draft, Closed)--
clientRoutes.get('/profile', verifyToken, allowRoles('client'), getProfileData);

// --Update Profile Details (name, email)--
clientRoutes.patch(
  '/profile/details',
  verifyToken,
  allowRoles('client'),
  updateProfileDetails
);

// --Get all jobs--
clientRoutes.get('/my-jobs', verifyToken, allowRoles('client'), getMyJobs);

// --Create new Job--
clientRoutes.post('/jobs', verifyToken, allowRoles('client'), createJob);

// --Update a job--
clientRoutes.put('/jobs/:jobId', verifyToken, allowRoles('client'), updateJob);

// --Get a single task by ID--
clientRoutes.get(
  '/jobs/:jobId',
  verifyToken,
  allowRoles('client'),
  getDataById
);

// --Delete a job--
clientRoutes.delete(
  '/jobs/:jobId',
  verifyToken,
  allowRoles('client'),
  deleteAJob
);

// --View Applicants per job--
clientRoutes.get(
  '/jobs/:jobId/applications',
  verifyToken,
  allowRoles('client'),
  getApplicationByJob
);

// --Accept or reject--
clientRoutes.patch(
  '/applicants/:applicantId/status',
  verifyToken,
  allowRoles('client'),
  acceptOrRejectApplicant
);

// --View All Applicants--
clientRoutes.get(
  '/applicants',
  verifyToken,
  allowRoles('client'),
  viewAllApplicants
);

// Description: Search freelancers by name, skills, etc.
// Query params:
//   name   - Filter by freelancer name (optional)
//   skills - Comma-separated list of skills (optional)
//   page   - Page number for pagination (default: 1)
//   limit  - Items per page (default: 10)
clientRoutes.get(
  '/search/freelancers',
  verifyToken,
  allowRoles('client'),
  searchFreelancers
);

export default clientRoutes;
