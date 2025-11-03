import { Request, Response } from 'express';
import UserModel from '../models/user.model';
import FreelancerProfile from '../models/freelancerProfile.model';
import ApplicationModel from '../models/application.model';
import { Types, Document } from 'mongoose';

// Define a type for a partial User document, assuming your UserModel returns this structure
interface PopulatedUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  role: string;
  createdAt: Date;
}

// Define a type for the populated Job document (as used in application population)
interface PopulatedJob extends Document {
  title: string;
  clientId: Types.ObjectId;
}

// Define a type for the application document after population
interface ApplicationDoc extends Document {
  userId: PopulatedUser | Types.ObjectId; // Could be populated or just the ID
  jobId: PopulatedJob | Types.ObjectId; // Could be populated or just the ID
  status: string;
  appliedAt: Date;
  coverLetter: string;
}

export const searchFreelancers = async (req: Request, res: Response) => {
  try {
    const clientId = req.user?.id;

    if (!clientId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { name, skills, page = 1, limit = 10 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const profileQuery: any = {};

    let userIds: Types.ObjectId[] = [];
    if (name) {
      const users = await UserModel.find({
        name: { $regex: name as string, $options: 'i' },
        role: 'freelancer',
      }).select('_id');
      // 💡 TYPING FIX: Explicitly type 'u' as any or the Document type
      userIds = users.map((u: any) => u._id);

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

    if (skills) {
      const skillsArray = Array.isArray(skills)
        ? (skills as string[])
        : (skills as string).split(',').map((s: string) => s.trim()); // 💡 TYPING FIX: Explicitly type 's'

      profileQuery.skills = { $in: skillsArray };
    }

    const [profiles, total] = await Promise.all([
      FreelancerProfile.find(profileQuery)
        .populate('userId', 'name email role createdAt')
        .skip(skip)
        .limit(Number(limit))
        .sort({ createdAt: -1 }),

      FreelancerProfile.countDocuments(profileQuery),
    ]); // 💡 TYPING FIX: Explicitly type 'p' as any

    const freelancerUserIds = profiles.map(
      (p: any) => (p.userId as any)?._id || p.userId
    );

    const applications = (await ApplicationModel.find({
      userId: { $in: freelancerUserIds },
    })
      .populate('jobId', 'title clientId')
      .select('userId status appliedAt coverLetter jobId')) as ApplicationDoc[]; // Cast result // 💡 TYPING FIX: Explicitly type 'acc' and 'id'

    const applicationsByFreelancer = freelancerUserIds.reduce(
      (acc: Record<string, any[]>, id: Types.ObjectId) => {
        acc[id.toString()] = [];
        return acc;
      },
      {} as Record<string, any[]>
    ); // 💡 TYPING FIX: Explicitly type 'app'

    applications.forEach((app: ApplicationDoc) => {
      // Ensure userId is not just an ObjectId before accessing toString()
      const userIdString =
        (app.userId as PopulatedUser)?._id?.toString() || app.userId.toString();
      applicationsByFreelancer[userIdString].push(app);
    }); // 💡 TYPING FIX: Explicitly type 'profile'

    const freelancersWithHistory = profiles
      .map((profile: any) => {
        const user = profile.userId as PopulatedUser | null;

        // 🛑 CRITICAL LOGIC FIX: Check for null/missing user data to prevent 500
        if (!user || !user._id) {
          return null;
        }

        const apps = applicationsByFreelancer[user._id.toString()] || [];
        // 💡 TYPING FIX: Explicitly type 'a'
        const appsToClientJobs = apps.filter((a: ApplicationDoc) => {
          const populatedJob = a.jobId as PopulatedJob;
          return (
            populatedJob &&
            populatedJob.clientId &&
            populatedJob.clientId.toString() === clientId
          );
        });

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
      })
      .filter((f: any) => f !== null); // Filter out nulls

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
