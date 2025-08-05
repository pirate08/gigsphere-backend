import ApplicationModel from '../models/application.model';
import JobModel from '../models/job.model';
import { Request, Response } from 'express';

// --View Applications per job--
export const getApplicationByJob = async (req: Request, res: Response) => {
  try {
    const clientId = req.user?.id;
    const jobId = req.params.jobId;

    // Check if the client is logged in or not--
    if (!clientId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // --Check if the job exists and belongs to the client--
    const job = await JobModel.findOne({ _id: jobId, clientId: clientId });

    if (!job) {
      return res.status(404).json({ message: 'Job Not found' });
    }

    // --Fetch all applications according to the job--
    const applications = await ApplicationModel.find({ job: jobId })
      .populate('userId', 'name email')
      .sort({ appliedAt: -1 });

    if (applications.length === 0) {
      return res.status(200).json({
        message: 'No applicants yet',
        applications: [],
        jobTitle: job.title || 'Job',
      });
    }

    return res.status(200).json({
      message: 'Applications fetched successfully',
      applications,
      jobTitle: job.title || 'Job',
      totalApplications: applications.length,
    });
  } catch (error) {
    console.log('Error fetching application', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};
