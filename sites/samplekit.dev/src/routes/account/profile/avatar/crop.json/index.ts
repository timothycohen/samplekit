import { ClientFetcher } from '$lib/http/client.svelte';
import { croppedImgSchema, type CroppedImg } from '$lib/image/common';
import type { RouteId } from './$types';
import type { z } from 'zod';

export type UpdateAvatarCropReq = Omit<z.infer<typeof croppedImgSchema>, 'url'>;
export type UpdateAvatarCropRes = { savedImg: CroppedImg };
export const updateAvatarCrop = new ClientFetcher<RouteId, UpdateAvatarCropRes, UpdateAvatarCropReq>(
	'PUT',
	'/account/profile/avatar/crop.json',
);
