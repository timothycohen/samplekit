import { ClientFetcher } from '$lib/http/client.svelte';
import type { CroppedImg, CropValue } from '$lib/image/common';
import type { RouteId } from './$types';

type PutReq = { crop: CropValue };
export type PutRes = { savedImg: CroppedImg };

export const updateAvatarCrop = new ClientFetcher<RouteId, PutRes, PutReq>('PUT', '/account/profile/avatar/crop.json');
