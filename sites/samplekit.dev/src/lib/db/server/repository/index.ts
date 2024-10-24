import { meta } from './meta';
import { presigned } from './presigned';
import { user } from './user';
import type { DBRepository } from './types';

export const db: DBRepository = {
	presigned,
	meta,
	user,
};
