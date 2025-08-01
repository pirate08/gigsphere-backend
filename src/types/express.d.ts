export interface DecodedToken {
  id: string;
  email: string;
  role: 'client' | 'freelancer';
}

declare global {
  namespace Express {
    interface Request {
      user?: DecodedToken;
    }
  }
}
