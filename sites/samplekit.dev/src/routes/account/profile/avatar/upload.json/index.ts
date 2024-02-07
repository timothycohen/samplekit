import { z } from 'zod';
import { cropSchema, type CroppedImg } from '$lib/db/client';
import { createClientFetch } from '$lib/http/client';
import type { Result } from '$lib/utils/common';
import type { RouteId } from './$types';

export const putReqSchema = z.object({ s3ObjectUrl: z.string().url(), crop: cropSchema });
type PutReq = z.infer<typeof putReqSchema>;

export type PutRes = { savedImg: CroppedImg | null };

export const checkAndSaveUploadedAvatar = createClientFetch<RouteId, PutRes, PutReq>(
	'PUT',
	'/account/profile/avatar/upload.json',
);

export const deleteAvatar = createClientFetch<RouteId, Result.Success>('DELETE', '/account/profile/avatar/upload.json');
