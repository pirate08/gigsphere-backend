import { Request, Response } from 'express';
import { generateToken } from '../utils/generateToken';
import UserModel from '../models/user.model';
import bcrypt from 'bcryptjs';

export const registerUser = async (req: Request, res: Response) => {
  const { name, email, password, confirmPassword, role } = req.body;

  //   --Logic to check if password and confirmPassword match--
  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords don't match" });
  }

  try {
    //   --Logic to check if user already exists--
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    //  --Logic to hash the password--
    const hashedPassword = await bcrypt.hash(password, 10);

    // --Logic to create new user--
    const newUser = await UserModel.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    res.status(201).json({
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      token: generateToken(newUser._id.toString(), newUser.email, newUser.role),
    });
  } catch (error) {
    console.error('Error registering user:', error);
    return res.status(500).json({ message: 'Server error', error });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    //   --Logic to check if user already exists--
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid Credentials' });
    }
    // --Check if passwords match--
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid Credentials' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id.toString(), user.email, user.role),
    });
  } catch (error) {
    console.log('Error in Login..', error);
    return res.status(500).json({ message: 'Server Error', error });
  }
};
