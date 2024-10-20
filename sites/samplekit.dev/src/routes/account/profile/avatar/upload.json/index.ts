import { z } from 'zod';
import { ClientFetcher } from '$lib/http/client.svelte';
import { cropSchema, type CroppedImg } from '$lib/image/common';
import type { Result } from '$lib/utils/common';
import type { RouteId } from './$types';

const routeId = '/account/profile/avatar/upload.json';
export const MAX_UPLOAD_SIZE = 1024 * 1024 * 3; // 3MB

export type GetSignedAvatarUploadUrlRes = { url: string; objectKey: string; formDataFields: Record<string, string> };
export const getSignedAvatarUploadUrl = new ClientFetcher<RouteId, GetSignedAvatarUploadUrlRes>('GET', routeId);

export const checkAndSaveUploadedAvatarReqSchema = z.object({ crop: cropSchema });
export type CheckAndSaveUploadedAvatarReq = z.infer<typeof checkAndSaveUploadedAvatarReqSchema>;
export type CheckAndSaveUploadedAvatarRes = { savedImg: CroppedImg | null };
export const checkAndSaveUploadedAvatar = new ClientFetcher<
	RouteId,
	CheckAndSaveUploadedAvatarRes,
	CheckAndSaveUploadedAvatarReq
>('PUT', routeId);

export type DeleteAvatarRes = Result.Success;
export const deleteAvatar = new ClientFetcher<RouteId, DeleteAvatarRes>('DELETE', routeId);
