import { Router } from 'express';

import bugReportController from '@controllers/bug-report-controller';
import validateRequest from '@middleware/validate-middleware';
import bugReportSchema from '@validations/bug-report-validator';

import { upload } from '@utils/multer';

const router = Router();

// ===================== ROUTES ===================== //

router
  .route('/bug-report')
  .post(
    upload.array('files', 5),
    validateRequest({ schema: bugReportSchema }),
    bugReportController.createBugReport,
  );

// ===================== ROUTES ===================== //

export default router;
