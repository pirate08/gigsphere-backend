import { Request, Response } from 'express';
import UserModel from '../models/user.model';
import FreelancerProfile from '../models/freelancerProfile.model';
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

    // 🔍 DEBUG: Log incoming parameters
    console.log('=== SEARCH DEBUG ===');
    console.log('Search params:', { name, skills, page, limit });

    // --Skip the first (page - 1) * limit results--
    const skip = (Number(page) - 1) * Number(limit);

    // --Build the profile query--
    const profileQuery: any = {};

    // --Handle name parameter (search in User model)--
    let userIds: any[] = [];
    if (name) {
      const users = await UserModel.find({
        name: { $regex: name as string, $options: 'i' },
        role: 'freelancer',
      }).select('_id');
      userIds = users.map((u) => u._id);

      console.log('Users found by name:', userIds.length);

      if (userIds.length === 0) {
        return res.status(200).json({
          message: 'No freelancers found',
          freelancers: [],
          pagination: {
            currentPage: Number(page),
            limit: Number(limit),
            total: 0,
            totalPages: 0,
          },
        });
      }

      profileQuery.userId = { $in: userIds };
    }

    // ✅ FIXED: Handle skills parameter - THREE DIFFERENT APPROACHES
    if (skills) {
      const skillsArray = Array.isArray(skills)
        ? (skills as string[])
        : (skills as string).split(',').map((s) => s.trim());

      console.log('Skills array:', skillsArray);

      const regexPattern = skillsArray.join('|');
      profileQuery.skills = {
        $regex: new RegExp(regexPattern, 'i'),
      };

      console.log(
        'Profile query for skills:',
        JSON.stringify(profileQuery.skills)
      );
    }

    // 🔍 DEBUG: Log final query
    console.log('Final profile query:', JSON.stringify(profileQuery));

    // 🔍 DEBUG: First, let's see what profiles exist
    const allProfiles = await FreelancerProfile.find({}).limit(5);
    console.log('Sample profiles in DB:');
    allProfiles.forEach((p) => {
      console.log('- Profile skills:', p.skills);
    });

    // --Fetch freelancer profiles from the database--
    const [profiles, total] = await Promise.all([
      FreelancerProfile.find(profileQuery)
        .populate('userId', 'name email role createdAt')
        .skip(skip)
        .limit(Number(limit))
        .sort({ createdAt: -1 }),

      FreelancerProfile.countDocuments(profileQuery),
    ]);

    console.log('Profiles found:', profiles.length);
    console.log('Total count:', total);

    // Get all user IDs from profiles
    const freelancerUserIds = profiles.map((p) => p.userId);

    // Get all applications for these freelancers (with job info)
    const applications = await ApplicationModel.find({
      userId: { $in: freelancerUserIds },
    })
      .populate('jobId', 'title clientId')
      .select('userId status appliedAt coverLetter jobId');

    // Group applications by freelancer
    const applicationsByFreelancer = freelancerUserIds.reduce((acc, id) => {
      acc[id.toString()] = [];
      return acc;
    }, {} as Record<string, any[]>);

    applications.forEach((app) => {
      applicationsByFreelancer[app.userId.toString()].push(app);
    });

    // Build final response - merge User data with Profile data
    const freelancersWithHistory = profiles.map((profile: any) => {
      const user = profile.userId;
      const apps = applicationsByFreelancer[user._id.toString()] || [];
      const appsToClientJobs = apps.filter(
        (a) => a.jobId && (a.jobId as any).clientId?.toString() === clientId
      );

      return {
        _id: profile._id,
        name: user.name,
        email: user.email,
        role: user.role,
        bio: profile.description,
        location: profile.location,
        skills: profile.skills,
        qualification: profile.qualification,
        yearsOfExperience: profile.yearsOfExperience,
        hourlyRate: profile.hourlyRate,
        portfolio: profile.portfolio,
        certificates: profile.certificates,
        experience: profile.experience,
        totalApplications: apps.length,
        applicationsToYourJobs: appsToClientJobs.length,
        recentApplications: appsToClientJobs.slice(0, 3),
      };
    });

    console.log('=== END DEBUG ===\n');

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
