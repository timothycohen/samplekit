import { db } from '$lib/db/server';
import { jsonFail, jsonOk, parseReqJson } from '$lib/http/server';
import { croppedImgSchema } from '$lib/image/common';
import type { UpdateAvatarCropRes } from '.';
import type { RequestHandler } from '@sveltejs/kit';

const updateAvatarCrop: RequestHandler = async ({ locals, request }) => {
	const { user } = await locals.seshHandler.userOrRedirect();
	if (!user.avatar) return jsonFail(400, 'No avatar to crop');

	const body = await parseReqJson(request, croppedImgSchema, { overrides: { url: user.avatar.url } });
	if (!body.success) return jsonFail(400);
	const avatar = body.data;

	await db.user.update({ userId: user.id, values: { avatar } });

	return jsonOk<UpdateAvatarCropRes>({ savedImg: avatar });
};

export const PUT = updateAvatarCrop;
