import { Router } from 'express';
import messageController from '@controllers/message-controller';
import authMiddleware from '@middleware/auth-middleware';
import validateRequest from '@middleware/validate-middleware';
import { createMessageSchema } from '@validations/message-validator';

const router = Router();

router.use(authMiddleware);

router.post(
    '/',
    validateRequest({ schema: createMessageSchema }),
    messageController.createMessage,
);
router.get('/', messageController.getMessages);

export default router;
