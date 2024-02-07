import { createClientFetch } from '$lib/http/client';
import type { RouteId } from './$types';

// todo - passing the objectUrl to client and after uploading it's sent to the db to save the url to the user's account.
// we're only checking its existence. a user could change the js to upload a file but then save a different url to their account (one they've checked exists).
// should instead save it to the server when creating the upload url and then only check its existence after the client says it's been uploaded
export type GetRes = { uploadUrl: string; objectUrl: string; fields: Record<string, string> };

export const getS3UploadPost = createClientFetch<RouteId, GetRes>('GET', '/s3/upload-post.json');

export const MAX_UPLOAD_SIZE = 1024 * 1024 * 3; // 3MB
