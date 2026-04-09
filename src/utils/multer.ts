import multer, { FileFilterCallback } from 'multer';
import { Request } from 'express';
import path from 'path';
import fs from 'fs';
import { generateId } from '.';

// Make sure uploadsDir is defined somewhere
const uploadsDir = path.join(__dirname, '../../public/bug-attachments');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (
    _: Request,
    __: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void,
  ) => {
    cb(null, uploadsDir);
  },
  filename: (
    _: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void,
  ) => {
    cb(null, `${generateId()}.png`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 1 * 1024 * 1024 }, // 1 MB
  fileFilter: (_: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    const allowedMimes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PNG, JPEG, JPG and WEBP files are allowed.'));
    }
  },
});
