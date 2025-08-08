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

const clientRoutes = express.Router();

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

export default clientRoutes;
