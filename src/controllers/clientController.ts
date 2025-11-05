import JobModel, { Job } from '../models/job.model';
import { Request, Response } from 'express';
import { notifyFreelancersOfNewJob } from '../services/notificationService';
import mongoose from 'mongoose';

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

    const savedData = (await newJob.save()) as Job;

    // --Add notification feature here--
    if (savedData.status === 'open') {
      const jobIdString = (savedData._id as mongoose.Types.ObjectId).toString();

      notifyFreelancersOfNewJob(jobIdString, savedData.title);
    }

    return res.status(201).json({
      message: 'Job created Successfully',
      job: savedData,
    });
  } catch (error) {
    console.log('Failed to create job', error);
    return res.status(500).json({ message: 'Server Error' });
  }
};

// --Update a job--
export const updateJob = async (req: Request, res: Response) => {
  try {
    const clientId = req.user?.id;
    const jobId = req.params.jobId;
    const newStatus = req.body.status;

    if (!clientId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // 1. Find the existing job to get its current status
    const oldJob = await JobModel.findOne({ _id: jobId, clientId }).select(
      'status title'
    );

    if (!oldJob) {
      return res.status(404).json({ message: 'Job not found or unauthorized' });
    }
    const oldStatus = oldJob.status; // 2. Perform the update

    // Cast the result to the Job interface
    const updatedJob = (await JobModel.findOneAndUpdate(
      { _id: jobId, clientId },
      req.body,
      { new: true, runValidators: true }
    )) as Job;

    if (!updatedJob) {
      return res.status(404).json({ message: 'Job not found or unauthorized' });
    }

    // 3. 📢 NOTIFICATION TRIGGER: Send notification ONLY if status changed TO 'open'
    if (updatedJob.status === 'open' && oldStatus !== 'open') {
      const updatedJobIdString = (
        updatedJob._id as mongoose.Types.ObjectId
      ).toString();

      notifyFreelancersOfNewJob(updatedJobIdString, updatedJob.title);
    }

    return res.status(200).json({
      message: 'Job Updated Successfully',
      job: updatedJob,
    });
  } catch (error) {
    console.log('Failed to Update Job', error);
    return res.status(500).json({ message: 'Server Error' });
  }
};

// --Get a single job details by ID--
export const getDataById = async (req: Request, res: Response) => {
  try {
    const clientId = req.user?.id;
    const jobId = req.params.jobId;

    if (!clientId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const findJob = await JobModel.findOne({ _id: jobId, clientId });

    if (!findJob) {
      return res.status(404).json({ message: 'No job find in that id.' });
    }

    return res.status(200).json({
      message: 'Single job fetched successfully',
      job: findJob,
    });
  } catch (error) {
    console.log('Unable to find job in that id', error);
    return res.status(500).json({ message: 'Server Error' });
  }
};

// --Delete a job--
export const deleteAJob = async (req: Request, res: Response) => {
  try {
    const clientId = req.user?.id;
    const jobId = req.params.jobId;

    if (!clientId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const deleteJob = await JobModel.findByIdAndDelete({
      _id: jobId,
      clientId,
    });

    if (!deleteJob) {
      return res
        .status(404)
        .json({ message: 'Could not find any job to delete' });
    }

    return res.status(200).json({
      message: 'Job Deleted',
      job: deleteJob,
    });
  } catch (error) {
    console.log('Unable to delete a job', error);
    return res.status(500).json({ message: 'Server Error' });
  }
};
