import { z } from 'zod';
import { cropSchema, type CroppedImg } from '$lib/db/client';
import { createClientFetch } from '$lib/http/client';
import type { Result } from '$lib/utils/common';
import type { RouteId } from './$types';

const routeId = '/account/profile/avatar/upload.json';
export const MAX_UPLOAD_SIZE = 1024 * 1024 * 3; // 3MB

export type GetRes = { uploadUrl: string; fields: Record<string, string> };

export const putReqSchema = z.object({ crop: cropSchema });
export type PutReq = z.infer<typeof putReqSchema>;
export type PutRes = { savedImg: CroppedImg | null };

export const getSignedAvatarUploadUrl = createClientFetch<RouteId, GetRes>('GET', routeId);
export const checkAndSaveUploadedAvatar = createClientFetch<RouteId, PutRes, PutReq>('PUT', routeId);
export const deleteAvatar = createClientFetch<RouteId, Result.Success>('DELETE', routeId);
