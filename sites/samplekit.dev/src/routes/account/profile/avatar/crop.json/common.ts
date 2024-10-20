import { croppedImgSchema, type CroppedImg } from '$lib/image/common';
import type { z } from 'zod';

export type UpdateAvatarCropReq = Omit<z.infer<typeof croppedImgSchema>, 'url'>;
export type UpdateAvatarCropRes = { savedImg: CroppedImg };
