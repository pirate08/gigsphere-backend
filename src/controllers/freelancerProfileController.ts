import { Request, Response } from 'express';
import { Types } from 'mongoose';
import FreelancerProfile from '../models/freelancerProfile.model';
import UserModel from '../models/user.model';
import ApplicationModel from '../models/application.model';

// --Get and Convert Authenticated User ID--
const getUserId = (req: Request): Types.ObjectId | null => {
  if (!req.user?.id) return null;
  try {
    return new Types.ObjectId(req.user.id);
  } catch (error) {
    return null;
  }
};

// --Create new Profile(POST)--
export const createProfile = async (req: Request, res: Response) => {
  try {
    // --Checking the authorization--
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({ message: 'Authorization required' });
    }

    // --Checking the existing user--
    const existingUser = await FreelancerProfile.findOne({ userId });

    if (existingUser) {
      return res
        .status(400)
        .json({ message: 'Profile already exists. Use the update endpoint.' });
    }

    // --Create the new profile--
    const profile = new FreelancerProfile({
      userId,
      ...req.body,
    });

    await profile.save();
    return res.status(201).json({
      message: 'Profile created successfully...',
      profile,
    });
  } catch (error) {
    console.log('Error in creating the profile ', error);
    return res.status(500).json({ message: 'Server error creating profile' });
  }
};

// --Get Profile Details(GET)--
export const getProfileDetails = async (req: Request, res: Response) => {
  try {
    // --Authorization check--
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ message: 'Authorization required.' });
    }
    // --Find the name and email--
    const user = await UserModel.findById(userId).select('name email');
    if (!user) {
      return res.status(401).json({ message: 'User account not found.' });
    }

    // --Fetch Profile from the database--
    const profile = await FreelancerProfile.findOne({ userId });

    // --Formating the resposne--
    const responseData = {
      fullName: user.name,
      email: user.email,
      avatar: user.name ? user.name.charAt(0).toUpperCase() : '?',
      profile: profile || null,
    };

    return res.status(200).json({
      message: 'Profile fetched successfully',
      responseData,
    });
  } catch (error) {
    console.log('Error fetching profile', error);
    return res.status(500).json({ message: 'Error in fetching user profile.' });
  }
};

// --Update profile details(PATCH)--
export const updateProfileDetails = async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ message: 'Authorization required.' });
    }

    const {
      name,
      email,
      portfolioId,
      portfolioUpdate,
      certificateId,
      certificateUpdate,
      experienceId,
      experienceUpdate,
      ...profileUpdates
    } = req.body;

    const updatedData: { profile: any; user: any } = {
      profile: null,
      user: null,
    };

    // 1. Update USER MODEL (Name and Email)
    const userFieldsToUpdate: { [key: string]: any } = {};

    if (name) userFieldsToUpdate.name = name;
    if (email) userFieldsToUpdate.email = email;

    if (Object.keys(userFieldsToUpdate).length > 0) {
      const updatedUser = await UserModel.findByIdAndUpdate(
        userId,
        { $set: userFieldsToUpdate },
        { new: true, runValidators: true, select: 'name email' }
      );
      updatedData.user = updatedUser;
    }

    // 2. Update FREELANCER PROFILE MODEL

    // First, handle top-level profile updates (description, skills, etc.)
    if (Object.keys(profileUpdates).length > 0) {
      const updatedProfile = await FreelancerProfile.findOneAndUpdate(
        { userId },
        { $set: profileUpdates },
        { new: true, runValidators: true }
      );

      if (!updatedProfile) {
        return res.status(404).json({
          message: 'Profile not found. Please create one first.',
        });
      }
      updatedData.profile = updatedProfile;
    }

    // Then, handle nested array updates (portfolio, certificates, experience)

    // Handle portfolio item update (specific item by _id)
    if (portfolioId && portfolioUpdate) {
      const updateFields: any = {};

      if (portfolioUpdate.name) {
        updateFields['portfolio.$.name'] = portfolioUpdate.name;
      }
      if (portfolioUpdate.url) {
        updateFields['portfolio.$.url'] = portfolioUpdate.url;
      }
      if (portfolioUpdate.description) {
        updateFields['portfolio.$.description'] = portfolioUpdate.description;
      }

      const updatedProfile = await FreelancerProfile.findOneAndUpdate(
        { userId, 'portfolio._id': portfolioId },
        { $set: updateFields },
        { new: true, runValidators: true }
      );

      if (!updatedProfile) {
        return res.status(404).json({
          message: 'Portfolio item not found.',
        });
      }
      updatedData.profile = updatedProfile;
    }

    // Handle certificate item update (specific item by _id)
    if (certificateId && certificateUpdate) {
      const updateFields: any = {};

      if (certificateUpdate.name) {
        updateFields['certificates.$.name'] = certificateUpdate.name;
      }
      if (certificateUpdate.issuer !== undefined) {
        updateFields['certificates.$.issuer'] = certificateUpdate.issuer;
      }
      if (certificateUpdate.date !== undefined) {
        updateFields['certificates.$.date'] = certificateUpdate.date;
      }

      const updatedProfile = await FreelancerProfile.findOneAndUpdate(
        { userId, 'certificates._id': certificateId },
        { $set: updateFields },
        { new: true, runValidators: true }
      );

      if (!updatedProfile) {
        return res.status(404).json({
          message: 'Certificate not found.',
        });
      }
      updatedData.profile = updatedProfile;
    }

    // Handle experience item update (specific item by _id)
    if (experienceId && experienceUpdate) {
      const updateFields: any = {};

      if (experienceUpdate.title) {
        updateFields['experience.$.title'] = experienceUpdate.title;
      }
      if (experienceUpdate.company) {
        updateFields['experience.$.company'] = experienceUpdate.company;
      }
      if (experienceUpdate.startDate) {
        updateFields['experience.$.startDate'] = experienceUpdate.startDate;
      }
      if (experienceUpdate.endDate !== undefined) {
        updateFields['experience.$.endDate'] = experienceUpdate.endDate;
      }
      if (experienceUpdate.isCurrent !== undefined) {
        updateFields['experience.$.isCurrent'] = experienceUpdate.isCurrent;
      }
      if (experienceUpdate.description !== undefined) {
        updateFields['experience.$.description'] = experienceUpdate.description;
      }

      const updatedProfile = await FreelancerProfile.findOneAndUpdate(
        { userId, 'experience._id': experienceId },
        { $set: updateFields },
        { new: true, runValidators: true }
      );

      if (!updatedProfile) {
        return res.status(404).json({
          message: 'Experience not found.',
        });
      }
      updatedData.profile = updatedProfile;
    }

    // 3. Final Response
    if (!updatedData.user && !updatedData.profile) {
      return res.status(400).json({
        message: 'No valid fields provided for update.',
      });
    }

    return res.status(200).json({
      message: 'Profile details updated successfully',
      data: {
        fullName: updatedData.user?.name || name || 'N/A',
        email: updatedData.user?.email || email || 'N/A',
        profile: updatedData.profile,
      },
    });
  } catch (error: any) {
    console.error('Error updating profile details:', error);
    return res.status(500).json({
      message: 'Error in updating profile details',
      error: error.message || 'Unknown error',
    });
  }
};

// --Freelancer Dashboard Stats(GET)--
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    // --Authorization Check--
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ message: 'Authorization required' });
    }

    // --Fetch dashboard stats--
    const stats = await ApplicationModel.aggregate([
      { $match: { userId: userId } },
      {
        $facet: {
          // --1.Total Applied--
          totalApplied: [{ $count: 'count' }],
          // --2.Pending Applications--
          pendingApplications: [
            { $match: { status: 'pending' } },
            { $count: 'count' },
          ],
          // --3.Accepted Jobs--
          acceptedApplications: [
            { $match: { status: 'accepted' } },
            { $count: 'count' },
          ],
          // --4.Rejected Applications--
          rejectedApplications: [
            { $match: { status: 'rejected' } },
            { $count: 'count' },
          ],
        },
      },
    ]);

    const jobStats = {
      totalApplied: stats[0]?.totalApplied[0]?.count || 0,
      pendingApplications: stats[0]?.pendingApplications[0]?.count || 0,
      acceptedApplications: stats[0]?.acceptedApplications[0]?.count || 0,
      rejectedApplications: stats[0]?.rejectedApplications[0]?.count || 0,
    };

    return res
      .status(200)
      .json({ message: 'Dashboard details fetched successfully', jobStats });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return res
      .status(500)
      .json({ message: 'Failed to fetch dashboard statistics.' });
  }
};
