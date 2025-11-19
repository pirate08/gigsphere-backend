import { Request, Response } from 'express';
import { Types } from 'mongoose';
import bcrypt from 'bcryptjs';
import UserModel, { UserDocument } from '../models/user.model';

// --Get and Convert Authenticated User ID--
const getUserId = (req: Request): Types.ObjectId | null => {
  if (!req.user?.id) return null;
  try {
    return new Types.ObjectId(req.user.id);
  } catch (error) {
    return null;
  }
};

// --Change password and update previous password--
export const changePassword = async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({ message: 'Authorization required...' });
    }

    const { currentPassword, newPassword, confirmPassword } = req.body;

    // --Input Validation--
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res
        .status(400)
        .json({ message: 'All password fields are required.' });
    } else if (newPassword !== confirmPassword) {
      return res
        .status(400)
        .json({ message: 'New password and confirm password do not match.' });
    } else if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: 'Password must be at least 6 characters long.' });
    }

    // --Fetch user, explicitly selecting the password hash--
    const user = (await UserModel.findById(userId).select('+password')) as
      | (UserDocument & { password: string })
      | null;

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // --Verify current password against the stored hash--
    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res
        .status(400)
        .json({ message: 'Current password is incorrect.' });
    }

    const saltRounds = 10;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // --Update the user's password--
    user.password = newPasswordHash;
    await user.save();

    return res.status(200).json({
      message: 'Password changed successfully',
      user: {
        name: user.name,
      },
    });
  } catch (error) {
    console.log('Error changing password', error);
    res.status(500).json({ message: 'Server Error in changing password.' });
  }
};
