import { Request, Response } from 'express';
import { Types } from 'mongoose';
import bcrypt from 'bcryptjs';
import UserModel from '../models/user.model';
import JobModel from '../models/job.model';

// --Function to handle profile data (eg: Total work, opened jobs, etc.)
export const getProfileData = async (req: Request, res: Response) => {
  try {
    const clientId = req.user?.id;

    if (!clientId) {
      res.status(401).json({ message: 'Unauthorized' });
    }

    // --Covert the user to string and then to mongoose ObjectId--
    const userIdString = req.user?.id;
    const mongooseUserId = new Types.ObjectId(userIdString);

    // --Fetch User Data--
    const user = await UserModel.findById(mongooseUserId).select('name email');
    if (!user) {
      res.status(404).json({ message: 'User not found' });
    }

    // --Calculate Job Stats--

    const jobStats = await JobModel.aggregate([
      { $match: { clientId: mongooseUserId } },
      {
        $facet: {
          totalWork: [{ $count: 'count' }],
          openJobs: [{ $match: { status: 'open' } }, { $count: 'count' }],
          draftJobs: [{ $match: { status: 'draft' } }, { $count: 'count' }],
          closedJobs: [{ $match: { status: 'closed' } }, { $count: 'count' }],
        },
      },
    ]);

    // --Extract counts safely--
    const stats = {
      totalWork: jobStats[0].totalWork[0]?.count || 0,
      openJobs: jobStats[0].openJobs[0]?.count || 0,
      draftJobs: jobStats[0]?.draftJobs[0]?.count || 0,
      closedJobs: jobStats[0]?.closedJobs[0]?.count || 0,
    };

    // --Construct Final Response Object--
    const responseData = {
      id: user?._id,
      name: user?.name,
      email: user?.email,
      avatar: user?.name.charAt(0).toUpperCase(),
      ...stats,
    };

    // --Send Response--
    return res.status(200).json(responseData);
  } catch (error) {
    console.log('Error fetching profile data', error);
    return res.status(500).json({ message: 'Server Error' });
  }
};

// --Update name and email--
export const updateProfileDetails = async (req: Request, res: Response) => {
  try {
    const clientId = req.user?.id;

    if (!clientId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const userIdString = req.user?.id;
    const { fullName, email } = req.body;

    // --Validate Input--
    if (!fullName || !email) {
      return res
        .status(400)
        .json({ message: 'Full name and email are required' });
    }

    const mongooseUserId = new Types.ObjectId(userIdString);

    // --Check if the new email is already taken by another user--
    const existingUser = await UserModel.findOne({
      email: email.toLowerCase(),
      _id: { $ne: mongooseUserId },
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Email is already in use' });
    }

    // --Update User Details--
    const updateUser = await UserModel.findByIdAndUpdate(
      mongooseUserId,
      {
        name: fullName,
        email: email.toLowerCase(),
      },
      {
        new: true,
        runValidators: true,
        select: 'name email',
      }
    );

    if (!updateUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // --Send response--
    return res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        fullName: updateUser.name,
        email: updateUser.email,
      },
    });
  } catch (error) {
    console.log('Error updating profile details', error);
    return res.status(500).json({ message: 'Server Error' });
  }
};
