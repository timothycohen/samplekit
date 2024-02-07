import { createClientFetch } from '$lib/http/client';
import type { CroppedImg, ImgCrop } from '$lib/db/client';
import type { RouteId } from './$types';

type PutReq = { crop: ImgCrop };
export type PutRes = { savedImg: CroppedImg };

export const updateAvatarCrop = createClientFetch<RouteId, PutRes, PutReq>('PUT', '/account/profile/avatar/crop.json');
