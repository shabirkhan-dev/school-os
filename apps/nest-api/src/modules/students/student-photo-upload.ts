import { randomUUID } from 'node:crypto';
import { extname } from 'node:path';

import { BadRequestException } from '@nestjs/common';
import type { Request } from 'express';
import { diskStorage } from 'multer';

import {
	STUDENT_PHOTO_ALLOWED_MIME,
	STUDENT_PHOTO_MAX_BYTES,
	STUDENT_PHOTO_UPLOAD_DIR,
} from './student-photo-storage.service';

export function createStudentPhotoMulterOptions() {
	return {
		storage: diskStorage({
			destination: STUDENT_PHOTO_UPLOAD_DIR,
			filename: (_req, file, callback) => {
				const extension = extensionForMime(file.mimetype) ?? safeExtension(file.originalname);
				if (!extension) {
					callback(new BadRequestException('Unsupported photo file type'), '');
					return;
				}
				callback(null, `${randomUUID()}${extension}`);
			},
		}),
		limits: { fileSize: STUDENT_PHOTO_MAX_BYTES },
		fileFilter: (
			_req: Request,
			file: Express.Multer.File,
			callback: (error: Error | null, acceptFile: boolean) => void,
		) => {
			if (!STUDENT_PHOTO_ALLOWED_MIME.has(file.mimetype)) {
				callback(new BadRequestException('Photo must be a JPEG, PNG, or WebP image'), false);
				return;
			}
			callback(null, true);
		},
	};
}

export { resolveRequestOrigin } from '@/modules/profiles/avatar-upload';

function extensionForMime(mime: string): string | null {
	switch (mime) {
		case 'image/jpeg':
			return '.jpg';
		case 'image/png':
			return '.png';
		case 'image/webp':
			return '.webp';
		default:
			return null;
	}
}

function safeExtension(filename: string): string | null {
	const extension = extname(filename).toLowerCase();
	if (extension === '.jpg' || extension === '.jpeg') return '.jpg';
	if (extension === '.png' || extension === '.webp') return extension;
	return null;
}
