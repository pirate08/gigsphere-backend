import { NotificationModel } from '../models/notification.model';
import UserModel from '../models/user.model';

export const notifyFreelancersOfNewJob = async (
  jobId: string,
  jobTitle: string
) => {
  try {
    console.log(
      `Starting notification broadcast for job: ${jobTitle} (${jobId})`
    );

    // -- 1. Find All Freelancers--
    const freelancer = await UserModel.find({ role: 'freelancer' }).select(
      '_id'
    );

    if (freelancer.length === 0) {
      console.log('No freelancers available to notify');
      return;
    }

    // -- 2. Prepare notifications for bulk insertion--
    const notification = freelancer.map((freelancer) => ({
      recipientId: freelancer._id,
      type: 'NEW_JOB_OPEN',
      message: `New job posted ${jobTitle} is now open for applications!`,
      link: `/find-work/job-details/${jobId}`,
      read: false,
    }));

    // -- 3. Insert all notifications efficiently
    await NotificationModel.insertMany(notification);
    console.log(`Successfully notified ${freelancer.length} freelancers.`);
  } catch (error) {
    console.error('Error broadcasting new job notification:', error);
  }
};
