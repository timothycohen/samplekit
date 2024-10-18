import { z } from 'zod';
import { ClientFetcher } from '$lib/http/client.svelte';
import { cropSchema, type CroppedImg } from '$lib/image/common';
import type { Result } from '$lib/utils/common';
import type { RouteId } from './$types';

const routeId = '/account/profile/avatar/upload.json';
export const MAX_UPLOAD_SIZE = 1024 * 1024 * 3; // 3MB

export type GetRes = { url: string; objectKey: string; formDataFields: Record<string, string> };
export const getSignedAvatarUploadUrl = new ClientFetcher<RouteId, GetRes>('GET', routeId);

export const putReqSchema = z.object({ crop: cropSchema });
export type PutReq = z.infer<typeof putReqSchema>;
export type PutRes = { savedImg: CroppedImg | null };
export const checkAndSaveUploadedAvatar = new ClientFetcher<RouteId, PutRes, PutReq>('PUT', routeId);

export type DelRes = Result.Success;
export const deleteAvatar = new ClientFetcher<RouteId, DelRes>('DELETE', routeId);
