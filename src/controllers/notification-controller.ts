import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';

import NotificationModel from '@models/notification-model';
import AdminUserModel from '@models/admin-user-model';

export default {
  async getNotificationList(req: Request, res: Response, next: NextFunction) {
    const user = req.user;
    const email = user?.email;
    try {
      const notifications = await NotificationModel.findOne({ email });
      return res.status(200).json({
        success: true,
        data: notifications?.notifications || [],
      });
    } catch (error) {
      next(error);
    }
  },
  async updateNotificationStatus(req: Request, res: Response, next: NextFunction) {
    const user = req.user;
    const email = user?.email;
    const { notificationId, actionType, actionData } = req.body;

    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      const isExistNotification = await NotificationModel.findOne({ email });
      if (!isExistNotification) {
        return res.status(404).json({ success: false, message: 'Notification not found' });
      }

      if (actionType === 'invite') {
        await AdminUserModel.updateOne(
          { 'users._id': actionData.userId },
          {
            $set: {
              'users.$.status': 'active',
              'users.$.joinedAt': new Date(),
              'users.$.userId': user?._id,
            },
          },
          { session },
        );
        await NotificationModel.findByIdAndUpdate(
          isExistNotification._id,
          {
            $pull: { notifications: { _id: notificationId } },
          },
          { session },
        );

        await session.commitTransaction();

        return res.status(200).json({ success: true, message: 'Updated notification status' });
      }
    } catch (error) {
      await session.abortTransaction();
      next(error);
    } finally {
      session.endSession();
    }
  },
};
