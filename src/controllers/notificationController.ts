import { Request, Response } from 'express';
import { NotificationModel } from '../models/notification.model';

// --Fetch all Notification(GET)--
export const getNotifications = async (req: Request, res: Response) => {
  try {
    // --Authorization Check--
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Authorization required...' });
    }

    // --Fetch 20 notifications from newest to oldest--
    const notification = await NotificationModel.find({
      recipientId: userId,
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    //   --Count the unread notification--
    const unreadCount = await NotificationModel.countDocuments({
      recipientId: userId,
      read: false,
    });

    // --Sending it to the server--
    return res.status(200).json({
      message: 'Notification fetched successfully...',
      notification,
      unreadCount,
    });
  } catch (error) {
    console.log('Error in fetching notification', error);
    return res
      .status(500)
      .json({ message: 'Internal server error in fetching notification' });
  }
};

// --Mark As Read Feature (PATCH)--
export const markAsRead = async (req: Request, res: Response) => {
  try {
    // --Authorization Check--
    const userId = req.user?.id;
    const notificationId = req.params.notificationId;

    if (!userId) {
      return res.status(401).json({ message: 'Authorization Required...' });
    }

    const notification = await NotificationModel.findOneAndUpdate(
      {
        _id: notificationId,
        recipientId: userId,
        read: false,
      },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res
        .status(200)
        .json({ message: 'Notification already marked as read or not found' });
    }

    // --Send it to server--
    return res
      .status(200)
      .json({ message: 'Notification marked as read', notification });
  } catch (error) {
    console.log('Error in marking the notification as read...', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};
