import { Request, Response, NextFunction } from 'express';
import HttpStatus from 'http-status';
import DOMPurify from 'isomorphic-dompurify';

import MessageModel from '@models/message-model';

import { encrypt, decrypt, generateHash } from '@utils/encryption-util';
import { verifyToken } from '@utils/auth';

export default {
  async createMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const { content, emailLists = [], code, expiryTime, customExpiryValue, customExpiryUnit } = req.body;
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
        content: encrypt(DOMPurify.sanitize(content)),
        emailLists,
        code: encrypt(code),
        codeHash: generateHash(code),
        expiresAt,
        status: 'new',
      });

      res.status(HttpStatus.CREATED).json({
        success: true,
        message: 'MESSAGE_CREATED',
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

      const decryptedMessages = messages.map((msg) => {
        const msgObj = msg.toObject();
        msgObj.content = decrypt(msgObj.content);
        msgObj.code = decrypt(msgObj.code);
        return msgObj;
      });

      res.status(HttpStatus.OK).json({
        success: true,
        data: decryptedMessages,
      });
    } catch (error) {
      next(error);
    }
  },

  async getMessageByCode(req: Request, res: Response, next: NextFunction) {
    try {
      const { code } = req.params as { code: string };

      if (!code) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: 'CODE_REQUIRED',
        });
      }

      const codeHash = generateHash(code);
      const message = await MessageModel.findOne({ codeHash });

      if (!message) {
        return res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          message: 'MESSAGE_NOT_FOUND',
        });
      }

      // Identify viewer if authenticated
      let viewerEmail: string | undefined;
      let viewerId: string | undefined;

      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        const payload = verifyToken(token) as any;
        if (payload) {
          viewerEmail = payload.email;
          viewerId = payload.id || payload.userId || payload._id;
        }
      }

      const isSender = viewerId && message.sender.toString() === viewerId;

      // Check for expiration by date
      if (message.expiresAt && message.expiresAt < new Date()) {
        if (message.status !== 'expiry') {
          message.status = 'expiry';
          await message.save();
        }
        
        // If not sender, deny access
        if (!isSender) {
          return res.status(HttpStatus.GONE).json({
            success: false,
            message: 'MESSAGE_EXPIRED',
          });
        }
      }

      // If already marked as expiry/destroyed and not sender, deny access
      if (message.status === 'expiry' && !isSender) {
        return res.status(HttpStatus.GONE).json({
          success: false,
          message: 'MESSAGE_EXPIRED',
        });
      }

      // Access control for recipients
      if (message.emailLists && message.emailLists.length > 0 && !isSender) {
        if (!viewerEmail || !message.emailLists.includes(viewerEmail)) {
          return res.status(HttpStatus.FORBIDDEN).json({
            success: false,
            message: 'ACCESS_DENIED',
          });
        }
      }

      // Logic for non-sender views: track views
      if (!isSender) {
        message.viewCount += 1;

        if (message.emailLists && message.emailLists.length > 0) {
          // Private message: track unique recipient views
          if (viewerEmail) {
            const alreadyViewed = message.viewedBy.some((v: { email: string }) => v.email === viewerEmail);
            if (!alreadyViewed) {
              message.viewedBy.push({ email: viewerEmail, viewedAt: new Date() });
            }
          }
        }
        await message.save();
      }

      const decryptedMessage = message.toObject();
      decryptedMessage.content = decrypt(decryptedMessage.content);
      decryptedMessage.code = decrypt(decryptedMessage.code);

      res.status(HttpStatus.OK).json({
        success: true,
        data: decryptedMessage,
      });
    } catch (error) {
      next(error);
    }
  },
  async updateMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { content, emailLists, code, expiryTime, customExpiryValue, customExpiryUnit } = req.body;
      const { id: senderId } = req.user as { id: string };

      const message = await MessageModel.findOne({ _id: id, sender: senderId });

      if (!message) {
        return res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          message: 'MESSAGE_NOT_FOUND_OR_UNAUTHORIZED',
        });
      }

      if (content !== undefined) {
        message.content = encrypt(DOMPurify.sanitize(content));
      }

      if (emailLists !== undefined) {
        message.emailLists = emailLists;
      }

      if (code !== undefined) {
        message.code = encrypt(code);
        message.codeHash = generateHash(code);
      }

      if (expiryTime !== undefined) {
        let expiresAt: Date | undefined;

        if (expiryTime === 'never') {
          expiresAt = undefined;
        } else {
          expiresAt = new Date();
          let value: number;
          let unit: string;

          if (expiryTime === 'custom') {
            value = parseInt(customExpiryValue);
            unit = customExpiryUnit;
          } else {
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
              expiresAt.setMinutes(expiresAt.getMinutes() + 10);
          }
        }
        message.expiresAt = expiresAt;
      }

      await message.save();

      const decryptedMessage = message.toObject();
      decryptedMessage.content = decrypt(decryptedMessage.content);
      decryptedMessage.code = decrypt(decryptedMessage.code);

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'MESSAGE_UPDATED',
        data: decryptedMessage,
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { id: senderId } = req.user as { id: string };

      const message = await MessageModel.findOne({ _id: id, sender: senderId });

      if (!message) {
        return res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          message: 'MESSAGE_NOT_FOUND_OR_UNAUTHORIZED',
        });
      }

      if (message.status === 'delete') {
        await MessageModel.deleteOne({ _id: id });
        return res.status(HttpStatus.OK).json({
          success: true,
          message: 'MESSAGE_PERMANENTLY_DELETED',
        });
      }

      message.status = 'delete';
      await message.save();

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'MESSAGE_DELETED',
      });
    } catch (error) {
      next(error);
    }
  },

  async bulkDeleteMessages(req: Request, res: Response, next: NextFunction) {
    try {
      const { ids } = req.body;
      const { id: senderId } = req.user as { id: string };

      // Get all requested messages that belong to the user
      const messages = await MessageModel.find({ _id: { $in: ids }, sender: senderId });

      if (messages.length === 0) {
        return res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          message: 'MESSAGES_NOT_FOUND_OR_UNAUTHORIZED',
        });
      }

      const idsToPermanentlyDelete = messages
        .filter((msg) => msg.status === 'delete')
        .map((msg) => msg._id);

      const idsToMarkAsDeleted = messages
        .filter((msg) => msg.status !== 'delete')
        .map((msg) => msg._id);

      if (idsToPermanentlyDelete.length > 0) {
        await MessageModel.deleteMany({ _id: { $in: idsToPermanentlyDelete } });
      }

      if (idsToMarkAsDeleted.length > 0) {
        await MessageModel.updateMany({ _id: { $in: idsToMarkAsDeleted } }, { $set: { status: 'delete' } });
      }

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'MESSAGES_PROCESSED',
        deletedCount: idsToPermanentlyDelete.length,
        markedAsDeletedCount: idsToMarkAsDeleted.length,
      });
    } catch (error) {
      next(error);
    }
  },

  async restoreMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { id: senderId } = req.user as { id: string };

      const message = await MessageModel.findOne({ _id: id, sender: senderId });

      if (!message) {
        return res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          message: 'MESSAGE_NOT_FOUND_OR_UNAUTHORIZED',
        });
      }

      message.status = 'new';
      await message.save();

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'MESSAGE_RESTORED',
      });
    } catch (error) {
      next(error);
    }
  },

  async bulkRestoreMessages(req: Request, res: Response, next: NextFunction) {
    try {
      const { ids } = req.body;
      const { id: senderId } = req.user as { id: string };

      const result = await MessageModel.updateMany(
        { _id: { $in: ids }, sender: senderId },
        { $set: { status: 'new' } }
      );

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'MESSAGES_RESTORED',
        count: result.modifiedCount,
      });
    } catch (error) {
      next(error);
    }
  },
};
