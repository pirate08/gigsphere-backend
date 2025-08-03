import JobModel from '../models/job.model';
import { Request, Response } from 'express';

export const getMyJobs = async (req: Request, res: Response) => {
  try {
    //  --Fetch clientId from the request (assumed set by auth middleware)--
    const clientId = req.user?.id;

    if (!clientId) {
      res.status(401).json({ message: 'Unauthorized' });
    }

    const jobs = await JobModel.find({ clientId });

    if (jobs.length === 0) {
      res.status(200).json({
        message: 'No jobs added yet',
        jobs: [],
      });
    }

    return res.status(200).json({
      message: 'Job Fetched successfully..',
      jobs,
    });
  } catch (error) {
    console.log('Error fetching client jobs', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
