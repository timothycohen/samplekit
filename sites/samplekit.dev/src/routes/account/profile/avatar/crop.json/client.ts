import { ClientFetcher } from '$lib/http/client.svelte';
import type { RouteId } from './$types';
import type { UpdateAvatarCropRes, UpdateAvatarCropReq } from './common';

export const updateAvatarCrop = new ClientFetcher<RouteId, UpdateAvatarCropRes, UpdateAvatarCropReq>(
	'PUT',
	'/account/profile/avatar/crop.json',
);
