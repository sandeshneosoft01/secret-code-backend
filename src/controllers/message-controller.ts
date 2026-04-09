import { Request, Response, NextFunction } from 'express';
import MessageModel from '@models/message-model';
import { encrypt, decrypt, generateHash } from '@utils/encryption-util';
import { verifyToken } from '@utils/auth';

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
        content: encrypt(content),
        emailLists,
        code: encrypt(code),
        codeHash: generateHash(code),
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

      const decryptedMessages = messages.map((msg) => {
        const msgObj = msg.toObject();
        msgObj.content = decrypt(msgObj.content);
        msgObj.code = decrypt(msgObj.code);
        return msgObj;
      });

      res.status(200).json({
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
        return res.status(400).json({
          success: false,
          message: 'CODE_REQUIRED',
        });
      }

      const codeHash = generateHash(code);
      const message = await MessageModel.findOne({ codeHash });

      if (!message) {
        return res.status(404).json({
          success: false,
          message: 'MESSAGE_NOT_FOUND',
        });
      }

      // Check for expiration
      if (message.expiresAt && message.expiresAt < new Date()) {
        message.status = 'expiry';
        await message.save();
        return res.status(410).json({
          success: false,
          message: 'MESSAGE_EXPIRED',
        });
      }

      // Access control
      if (message.emailLists && message.emailLists.length > 0) {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return res.status(401).json({
            success: false,
            message: 'UNAUTHORIZED_ACCESS',
          });
        }

        const token = authHeader.split(' ')[1];
        const payload = verifyToken(token);

        if (!payload || !payload.email || !message.emailLists.includes(payload.email)) {
          return res.status(403).json({
            success: false,
            message: 'ACCESS_DENIED',
          });
        }
      }

      const decryptedMessage = message.toObject();
      decryptedMessage.content = decrypt(decryptedMessage.content);
      decryptedMessage.code = decrypt(decryptedMessage.code);

      res.status(200).json({
        success: true,
        data: decryptedMessage,
      });
    } catch (error) {
      next(error);
    }
  },
};
