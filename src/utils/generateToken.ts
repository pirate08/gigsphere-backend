import jwt from 'jsonwebtoken';

export const generateToken = (
  userId: string,
  email: string,
  role: string
): string => {
  return jwt.sign(
    { id: userId, email: email, role: role },
    process.env.JWT_SECRET as string,
    {
      expiresIn: '7d',
    }
  );
};
