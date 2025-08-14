import { Request, Response } from 'express';
import UserModel from '../models/user.model';
import JobModel from '../models/job.model';
import ApplicationModel from '../models/application.model';

export const searchFreelancers = async (req: Request, res: Response) => {
  try {
    // --Check if the client is logged in or not--
    const clientId = req.user?.id;

    if (!clientId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    // --Extract query parameters--
    const { name, skills, page = 1, limit = 10 } = req.query;
    // --Skip the first (page - 1) * limit results--
    const skip = (Number(page) - 1) * Number(limit);

    // --Search only for freelancers--
    const searchQuery: any = { role: 'freelancer' };

    // --Handling the name paramater--
    if (name) {
      searchQuery.name = { $regex: name as String, $options: 'i' };
    }

    // --Handling the skills parameter--
    if (skills) {
      const skillsArray = Array.isArray(skills)
        ? (skills as string[])
        : (skills as string).split(',').map((s) => s.trim());
      searchQuery.skills = {
        $in: skillsArray.map((skill) => new RegExp(skill, 'i')),
      };
    }

    // --Fetch freelancers from the database--
    const [freelancers, total] = await Promise.all([
      UserModel.find(searchQuery)
        .select('-password')
        .skip(skip)
        .limit(Number(limit))
        .sort({ createdAt: -1 }),

      UserModel.countDocuments(searchQuery),
    ]);

    // Get all freelancer IDs
    const freelancerIds = freelancers.map((f) => f._id);

    // Get all applications for these freelancers (with job info)
    const applications = await ApplicationModel.find({
      userId: { $in: freelancerIds },
    })
      .populate('jobId', 'title clientId')
      .select('userId status appliedAt coverLetter jobId');

    // Group applications by freelancer
    const applicationsByFreelancer = freelancerIds.reduce((acc, id) => {
      acc[id.toString()] = [];
      return acc;
    }, {} as Record<string, any[]>);

    applications.forEach((app) => {
      applicationsByFreelancer[app.userId.toString()].push(app);
    });

    // Build final response
    const freelancersWithHistory = freelancers.map((freelancer) => {
      const apps = applicationsByFreelancer[freelancer._id.toString()] || [];
      const appsToClientJobs = apps.filter(
        (a) => a.jobId && (a.jobId as any).clientId?.toString() === clientId
      );

      return {
        ...freelancer.toObject(),
        totalApplications: apps.length,
        applicationsToYourJobs: appsToClientJobs.length,
        recentApplications: appsToClientJobs.slice(0, 3), // last 3
      };
    });

    return res.status(200).json({
      message: 'Freelancers found successfully',
      freelancers: freelancersWithHistory,
      pagination: {
        currentPage: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Error searching freelancers:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
