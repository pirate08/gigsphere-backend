import JobModel from '../models/job.model';
import { Request, Response } from 'express';

// --Get all jobs--
export const getMyJobs = async (req: Request, res: Response) => {
  try {
    //  --Fetch clientId from the request (assumed set by auth middleware)--
    const clientId = req.user?.id;

    if (!clientId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const jobs = await JobModel.find({ clientId });

    if (jobs.length === 0) {
      return res.status(200).json({
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
    return res.status(500).json({ message: 'Server Error' });
  }
};

// -- Create a job--
export const createJob = async (req: Request, res: Response) => {
  try {
    const clientId = req.user?.id;

    if (!clientId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const newJob = new JobModel({
      ...req.body,
      clientId,
    });

    const savedData = await newJob.save();

    return res.status(201).json({
      message: 'Job created Successfully',
      job: savedData,
    });
  } catch (error) {
    console.log('Failed to create job', error);
    return res.status(500).json({ message: 'Server Error' });
  }
};
