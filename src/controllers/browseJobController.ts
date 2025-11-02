import { Request, Response } from 'express';
import ApplicationModel from '../models/application.model';
import JobModel from '../models/job.model';
import { Types } from 'mongoose';
import { ParsedQs } from 'qs';

// Define the shape of the expected query parameters (local to this controller)
interface JobQuery {
  search?: string;
  skills?: string;
  location?: string;
  minRate?: string;
  maxRate?: string;
  page?: string;
  limit?: string;
}

interface AuthenticatedRequest<TQuery = JobQuery> extends Request {
  query: TQuery & ParsedQs;
}

const getUserId = (req: Request): Types.ObjectId | null => {
  // req.user is available via global Express.Request definition
  if (!req.user?.id) return null;
  try {
    return new Types.ObjectId(req.user.id);
  } catch {
    return null;
  }
};

export const browseJobs = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // --Authorization Check--
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({
        message: 'Authorization Required. Freelancer token missing or invalid.',
      });
    }

    // --- Safely Extract and Process Query Parameters ---
    const { search, skills, location, minRate, maxRate, page, limit } =
      req.query as JobQuery;

    // Safely set defaults for pagination variables
    const pageStr = page || '1';
    const limitStr = limit || '10';

    // --Base Query Filter--
    const query: any = {
      status: 'open', // MANDATORY: Only open jobs are visible
    };

    // 1. Search by Title
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    // 2. Filter By Skills (uses $in: match AT LEAST ONE skill)
    if (skills && typeof skills === 'string') {
      const skillArray: string[] = skills
        .split(',')
        .map((s: string) => s.trim())
        .filter((s: string) => s.length > 0);

      if (skillArray.length > 0) {
        query.skills = { $in: skillArray };
      }
    }

    // 3. Filter by Location
    if (location && typeof location === 'string') {
      const locationArray: string[] = location
        .split(',')
        .map((l: string) => l.trim())
        .filter((l: string) => l.length > 0);

      if (locationArray.length > 0) {
        query.location = { $in: locationArray };
      }
    }

    // 4. Filter by Budget/Hourly Rate Range (Assumes 'budget' field is used)
    if (minRate || maxRate) {
      query.budget = {};

      // Safely parse numbers only if the query param exists and is a string
      const parsedMinRate =
        minRate && typeof minRate === 'string' ? Number(minRate) : null;
      const parsedMaxRate =
        maxRate && typeof maxRate === 'string' ? Number(maxRate) : null;

      if (parsedMinRate !== null && !isNaN(parsedMinRate)) {
        query.budget.$gte = parsedMinRate;
      }
      if (parsedMaxRate !== null && !isNaN(parsedMaxRate)) {
        query.budget.$lte = parsedMaxRate;
      }

      if (Object.keys(query.budget).length === 0) {
        delete query.budget;
      }
    }

    // --- 4. Pagination Setup ---
    const pageNumber = parseInt(pageStr);
    const limitNumber = parseInt(limitStr);
    const skip = (pageNumber - 1) * limitNumber;

    // a. Total matching count (for metadata)
    const totalJobs = await JobModel.countDocuments(query);

    // b. Fetch jobs with sorting and pagination
    const jobs = await JobModel.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber)
      .lean();

    // c. Find applications by the current user
    const appliedJobs = await ApplicationModel.find({ userId: userId })
      .select('jobId -_id')
      .lean();
    const appliedJobIds = appliedJobs.map((app) => app.jobId.toString());

    const jobsWithMetadata = jobs.map((job) => ({
      ...job,
      
      hasApplied: appliedJobIds.includes(job._id.toString()),
    }));

    return res.status(200).json({
      message: 'Jobs fetched successfully',
      data: jobsWithMetadata,
      metadata: {
        total: totalJobs,
        page: pageNumber,
        pages: Math.ceil(totalJobs / limitNumber),
      },
    });
  } catch (error) {
    console.error('Error browsing jobs:', error);
    return res
      .status(500)
      .json({ message: 'Server error while fetching jobs.' });
  }
};
