import { NotificationModel } from '../models/notification.model';
import JobModel from '../models/job.model';

export const notifyApplicationStatusChange = async (
  freelancerId: string,
  clientId: string,
  jobId: string,
  status: 'accepted' | 'rejected',
  applicationId: string
) => {
  try {
    // Fetch job details to include job title in notification
    const job = await JobModel.findById(jobId).select('title');

    if (!job) {
      console.error('Job not found for notification');
      return;
    }

    const message =
      status === 'accepted'
        ? `Congratulations! Your application for "${job.title}" has been accepted.`
        : `Your application for "${job.title}" has been rejected.`;

    const notification = await NotificationModel.create({
      recipientId: freelancerId,
      senderId: clientId,
      type: 'APPLICATION_STATUS',
      message,
      link: `/freelancer-dashboard/applications/${applicationId}`,
      read: false,
    });

    console.log(
      `Notification sent to freelancer ${freelancerId} for ${status} application`
    );
    return notification;
  } catch (error) {
    console.error('Error sending application status notification:', error);
  }
};
