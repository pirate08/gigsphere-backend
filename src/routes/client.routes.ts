import express from 'express';
import { verifyToken } from '../middlewares/auth.middleware';
import { allowRoles } from '../middlewares/roleMiddleware';
import {
  createJob,
  getMyJobs,
  updateJob,
} from '../controllers/clientController';

const clientRoutes = express.Router();

// --Get all jobs--
clientRoutes.get('/my-jobs', verifyToken, allowRoles('client'), getMyJobs);

// --Create new Job--
clientRoutes.post('/jobs', verifyToken, allowRoles('client'), createJob);

// --Update a job--
clientRoutes.put('/jobs/:jobId', verifyToken, allowRoles('client'), updateJob);

export default clientRoutes;
