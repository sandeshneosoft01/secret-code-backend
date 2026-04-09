import { Request, Response, NextFunction } from 'express';
import sharp from 'sharp';
import fs from 'fs/promises';

import BugReportModel from '@models/bug-report-model';

export default {
  async createBugReport(req: Request, res: Response, next: NextFunction) {
    const files = req.files as Express.Multer.File[];
    const { fullName, email, title, description } = req.body;

    try {
      const processedFiles = !files?.length
        ? []
        : await Promise.all(
            files.map(async (file) => {
              const originalPath = file.path;
              const compressedPath = originalPath.replace(/\.(png|jpg|jpeg)$/i, '.webp');

              // Step 1: read file into memory (releases file lock immediately)
              const inputBuffer = await fs.readFile(originalPath);

              // Step 2: delete original BEFORE using sharp (safe because buffer is in memory)
              await fs.unlink(originalPath);

              // Step 3: compress from buffer and save output
              await sharp(inputBuffer)
                .resize({ width: 1280, withoutEnlargement: true })
                .webp({ quality: 80 })
                .toFile(compressedPath);

              return `${req.protocol}://${req.get('host')}/bug-attachments/${file.filename.replace(/\.(png|jpg|jpeg)$/i, '.webp')}`;
            }),
          );

      const newBugReport = await BugReportModel.create({
        fullName,
        email,
        title,
        description,
        attachments: processedFiles,
      });

      return res.status(201).json({
        success: true,
        message: 'Bug report submitted successfully!',
      });
    } catch (error) {
      next(error);
    }
  },
};
