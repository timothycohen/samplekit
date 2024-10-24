import { ClientFetcher } from '$lib/http/client.svelte';
import type { RouteId } from './$types';
import type {
	GetSignedAvatarUploadUrlRes,
	CheckAndSaveUploadedAvatarRes,
	CheckAndSaveUploadedAvatarReq,
	DeleteAvatarRes,
} from './common';

const routeId: RouteId = '/account/profile/avatar/upload.json';

export const getSignedAvatarUploadUrl = new ClientFetcher<RouteId, GetSignedAvatarUploadUrlRes>('GET', routeId);

export const checkAndSaveUploadedAvatar = new ClientFetcher<
	RouteId,
	CheckAndSaveUploadedAvatarRes,
	CheckAndSaveUploadedAvatarReq
>('PUT', routeId);

export const deleteAvatar = new ClientFetcher<RouteId, DeleteAvatarRes>('DELETE', routeId);
