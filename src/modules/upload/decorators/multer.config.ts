import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { memoryStorage } from 'multer';

import { ALLOWED_IMAGE_MIME_TYPES, MAX_PICTURE_UPLOAD_SIZE } from '../../../constants/file-upload.constants';

export const pictureUploadConfig: MulterOptions = {
  storage: memoryStorage(),
  limits: {
    fileSize: MAX_PICTURE_UPLOAD_SIZE,
  },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_IMAGE_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.'),
        false,
      );
    }
  },
};
