import ApplicationModel from '../models/application.model';
import FreelancerProfile from '../models/freelancerProfile.model';
import JobModel from '../models/job.model';
import { Request, Response } from 'express';
import { Types } from 'mongoose';


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
    const applications = await ApplicationModel.find({ jobId: jobId })
      .populate('userId', 'name email')
      .sort({ appliedAt: -1 });

    if (applications.length === 0) {
      return res.status(200).json({
        message: 'No applicants yet',
        applications: [],
        jobTitle: job.title || 'Job',
        totalApplications: 0,
      });
    }

    // ✅ NEW: Get freelancer profile IDs for each application
    const applicationsWithProfiles = await Promise.all(
      applications.map(async (app: any) => {
        const profile = await FreelancerProfile.findOne({
          userId: app.userId._id,
        }).select('_id');

        return {
          ...app.toObject(),
          freelancerProfileId: profile?._id || null,
        };
      })
    );

    return res.status(200).json({
      message: 'Applications fetched successfully',
      applications: applicationsWithProfiles,
      jobTitle: job.title || 'Job',
      totalApplications: applications.length,
    });
  } catch (error) {
    console.log('Error fetching application', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// --Accept or Reject Applicants--
export const acceptOrRejectApplicant = async (req: Request, res: Response) => {
  try {
    const clientId = req.user?.id;
    const applicantId = req.params.applicantId; // Fixed: was applicationId
    const { status } = req.body;

    // Check if the client is logged in or not--
    if (!clientId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Validate applicantId
    if (!applicantId || !Types.ObjectId.isValid(applicantId)) {
      return res.status(400).json({ message: 'Invalid applicant ID' });
    }

    const validStatuses = ['pending', 'accepted', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    // --Find the Application--
    const application = await ApplicationModel.findById(applicantId).populate(
      'jobId'
    ); // Fixed: removed object wrapper

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Cast application.jobId to any to access its properties
    const populatedJob = application.jobId as any;

    // --Check if the job belongs to the logged in client--
    if (populatedJob.clientId.toString() !== clientId) {
      return res.status(403).json({ message: 'Forbidden: Not your job' });
    }

    application.status = status;
    await application.save();

    return res
      .status(200)
      .json({ message: `Application ${status}`, application });
  } catch (error) {
    console.log('Cannot accept or reject the applicant', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// --View All Applicants--
export const viewAllApplicants = async (req: Request, res: Response) => {
  try {
    const clientId = req.user?.id;

    if (!clientId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // --Find All Jobs--
    const clientJobs = await JobModel.find({ clientId }).select('_id');

    const jobIds = clientJobs.map((job) => job._id);

    // --All applicants from client Job
    const applications = await ApplicationModel.find({
      jobId: { $in: jobIds },
    })
      .populate('jobId')
      .populate('userId');

    return res
      .status(200)
      .json({ message: 'All applicants fetched', applications });
  } catch (error) {
    console.log('Failed to fetch all applicants', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};
