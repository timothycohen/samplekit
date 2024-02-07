import { generateS3UploadURL } from '$lib/cloudStorage/server';
import { jsonFail, jsonOk } from '$lib/http/server';
import type { GetRes } from '.';
import type { RequestHandler } from './$types';
import type { RequestEvent } from '@sveltejs/kit';

const getS3UploadUrl = async ({ locals }: RequestEvent) => {
	await locals.seshHandler.userOrRedirect();

	const res = await generateS3UploadURL();
	if (!res) return jsonFail(500, 'Failed to generate upload URL');
	else return jsonOk<GetRes>(res);
};

export const GET: RequestHandler = getS3UploadUrl;
