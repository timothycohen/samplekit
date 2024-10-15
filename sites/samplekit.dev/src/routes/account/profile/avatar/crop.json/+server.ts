import { db } from '$lib/db/server';
import { jsonFail, jsonOk } from '$lib/http/server';
import { croppedImgSchema } from '$lib/image/common';
import type { PutRes } from '.';
import type { RequestHandler } from '@sveltejs/kit';

const updateAvatarCrop: RequestHandler = async ({ locals, request }) => {
	const { user } = await locals.seshHandler.userOrRedirect();
	if (!user.avatar) return jsonFail(400, 'No avatar to crop');

	const body = await request.json().catch(() => null);

	const parsed = croppedImgSchema.safeParse({ ...body, url: user.avatar.url });
	if (!parsed.success) return jsonFail(400);
	const avatar = parsed.data;

	await db.user.update({ userId: user.id, values: { avatar } });

	return jsonOk<PutRes>({ savedImg: avatar });
};

export const PUT = updateAvatarCrop;
