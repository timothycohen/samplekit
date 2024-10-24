import { z } from 'zod';
import { cropSchema, type CroppedImg } from '$lib/image/common';
import type { Result } from '$lib/utils/common';

export const MAX_UPLOAD_SIZE = 1024 * 1024 * 3; // 3MB

export type GetSignedAvatarUploadUrlRes = { url: string; objectKey: string; formDataFields: Record<string, string> };

export const checkAndSaveUploadedAvatarReqSchema = z.object({ crop: cropSchema });
export type CheckAndSaveUploadedAvatarReq = z.infer<typeof checkAndSaveUploadedAvatarReqSchema>;
export type CheckAndSaveUploadedAvatarRes = { savedImg: CroppedImg | null };

export type DeleteAvatarRes = Result.Success;
