import { createClientFetch } from '$lib/http/client';
import type { CroppedImg, CropValue } from '$lib/image/client';
import type { RouteId } from './$types';

type PutReq = { crop: CropValue };
export type PutRes = { savedImg: CroppedImg };

export const updateAvatarCrop = createClientFetch<RouteId, PutRes, PutReq>('PUT', '/account/profile/avatar/crop.json');
