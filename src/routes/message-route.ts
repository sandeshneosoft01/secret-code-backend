import { Router } from 'express';
import messageController from '@controllers/message-controller';
import authMiddleware from '@middleware/auth-middleware';
import validateRequest from '@middleware/validate-middleware';
import { bulkMessagesSchema, createMessageSchema, updateMessageParamsSchema, updateMessageSchema } from '@validations/message-validator';

const router = Router();

router.get('/by-code/:code', messageController.getMessageByCode);

router.use(authMiddleware);

router.post(
    '/',
    validateRequest({ schema: createMessageSchema }),
    messageController.createMessage,
);
router.patch(
    '/:id',
    validateRequest({ validateParams: updateMessageParamsSchema, schema: updateMessageSchema }),
    messageController.updateMessage,
);
router.delete(
    '/:id',
    validateRequest({ validateParams: updateMessageParamsSchema }),
    messageController.deleteMessage,
);
router.patch(
    '/:id/restore',
    validateRequest({ validateParams: updateMessageParamsSchema }),
    messageController.restoreMessage,
);
router.post(
    '/bulk-delete',
    validateRequest({ schema: bulkMessagesSchema }),
    messageController.bulkDeleteMessages,
);
router.post(
    '/bulk-restore',
    validateRequest({ schema: bulkMessagesSchema }),
    messageController.bulkRestoreMessages,
);
router.get('/', messageController.getMessages);

export default router;
