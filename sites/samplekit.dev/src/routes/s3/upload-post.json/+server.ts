import { generateS3UploadPost } from '$lib/cloudStorage/server';
import { jsonFail, jsonOk } from '$lib/http/server';
import { MAX_UPLOAD_SIZE, type GetRes } from '.';
import type { RequestHandler } from './$types';
import type { RequestEvent } from '@sveltejs/kit';

const getS3UploadPost = async ({ locals }: RequestEvent) => {
	await locals.seshHandler.userOrRedirect();

	const res = await generateS3UploadPost({ contentLength: MAX_UPLOAD_SIZE });
	if (!res) return jsonFail(500, 'Failed to generate upload URL');
	return jsonOk<GetRes>(res);
};

export const GET: RequestHandler = getS3UploadPost;
