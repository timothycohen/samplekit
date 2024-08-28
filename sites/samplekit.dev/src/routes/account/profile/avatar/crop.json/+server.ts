import { eq } from 'drizzle-orm';
import { db, users } from '$lib/db/server';
import { jsonFail, jsonOk } from '$lib/http/server';
import { croppedImgSchema } from '$lib/image/common';
import type { PutRes } from '.';
import type { RequestHandler } from './$types';
import type { RequestEvent } from '@sveltejs/kit';

const updateAvatarCrop = async ({ locals, request }: RequestEvent) => {
	const { user } = await locals.seshHandler.userOrRedirect();
	if (!user.avatar) return jsonFail(400, 'No avatar to crop');

	const body = await request.json().catch(() => null);

	const parsed = croppedImgSchema.safeParse({ ...body, url: user.avatar.url });
	if (!parsed.success) return jsonFail(400);
	const avatar = parsed.data;

	await db.update(users).set({ avatar }).where(eq(users.id, user.id));

	return jsonOk<PutRes>({ savedImg: avatar });
};

export const PUT: RequestHandler = updateAvatarCrop;
