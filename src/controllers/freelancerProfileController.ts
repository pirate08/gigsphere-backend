import { Request, Response } from 'express';
import { Types } from 'mongoose';
import FreelancerProfile from '../models/freelancerProfile.model';
import UserModel from '../models/user.model';
// import ApplicationModel from '../models/application.model';

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
