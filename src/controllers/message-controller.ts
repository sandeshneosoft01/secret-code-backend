import { Request, Response, NextFunction } from 'express';
import MessageModel from '@models/message-model';

export default {
  async createMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const { content, emailLists, code, expiryTime, customExpiryValue, customExpiryUnit } = req.body;
      const { id: senderId } = req.user as { id: string };

      let expiresAt: Date | undefined;

      if (expiryTime && expiryTime !== 'never') {
        expiresAt = new Date();
        let value: number;
        let unit: string;

        if (expiryTime === 'custom') {
          value = parseInt(customExpiryValue);
          unit = customExpiryUnit;
        } else {
          // Parse something like "10m", "1h", "1d"
          value = parseInt(expiryTime.slice(0, -1));
          unit = expiryTime.slice(-1);
        }

        switch (unit) {
          case 'm':
            expiresAt.setMinutes(expiresAt.getMinutes() + value);
            break;
          case 'h':
            expiresAt.setHours(expiresAt.getHours() + value);
            break;
          case 'd':
            expiresAt.setDate(expiresAt.getDate() + value);
            break;
          default:
            expiresAt.setMinutes(expiresAt.getMinutes() + 10); // Default 10m
        }
      }

      const message = await MessageModel.create({
        sender: senderId,
        content,
        emailLists,
        code,
        expiresAt,
        status: 'new',
      });

      res.status(201).json({
        success: true,
        message: 'Message created successfully',
        data: message,
      });
    } catch (error) {
      next(error);
    }
  },

  async getMessages(req: Request, res: Response, next: NextFunction) {
    try {
      const { id: senderId } = req.user as { id: string };

      const messages = await MessageModel.find({ sender: senderId }).sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        data: messages,
      });
    } catch (error) {
      next(error);
    }
  },
};
