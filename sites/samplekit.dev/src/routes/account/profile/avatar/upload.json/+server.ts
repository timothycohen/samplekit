import { eq } from 'drizzle-orm';
import { createLimiter } from '$lib/botProtection/rateLimit/server';
import { deleteS3Object, generateS3UploadPost, invalidateCloudfront, keyController } from '$lib/cloudStorage/server';
import { detectModerationLabels } from '$lib/cloudStorage/server';
import { db, presigned, users } from '$lib/db/server';
import { jsonFail, jsonOk } from '$lib/http/server';
import { toHumanReadableTime } from '$lib/utils/common';
import { MAX_UPLOAD_SIZE, putReqSchema, type GetRes, type PutRes } from '.';
import type { RequestHandler } from './$types';
import type { RequestEvent } from '@sveltejs/kit';

// generateS3UploadPost enforces max upload size and denies any upload that we don't sign
// uploadLimiter rate limits the number of uploads a user can do
// presigned ensures we don't have to trust the client to tell us what the uploaded objectUrl is after the upload
// detectModerationLabels prevents explicit content

const uploadLimiter = createLimiter({
	id: 'checkAndSaveUploadedAvatar',
	limiters: [
		{ kind: 'global', rate: [300, 'd'] },
		{ kind: 'userId', rate: [2, '15m'] },
		{ kind: 'ipUa', rate: [3, '15m'] },
	],
});

const getSignedAvatarUploadUrl = async (event: RequestEvent) => {
	const { locals } = event;
	const { user } = await locals.seshHandler.userOrRedirect();

	const rateCheck = await uploadLimiter.check(event, { log: { userId: user.id } });
	if (rateCheck.forbidden) return jsonFail(403);
	if (rateCheck.limiterKind === 'global')
		return jsonFail(
			429,
			`This demo has hit its 24h max. Please try again in ${toHumanReadableTime(rateCheck.retryAfterSec)}`,
		);
	if (rateCheck.limited) return jsonFail(429, rateCheck.humanTryAfter('uploads'));

	const key = keyController.create.user.avatar({ userId: user.id });
	const res = await generateS3UploadPost({
		key,
		maxContentLength: MAX_UPLOAD_SIZE,
		expireSeconds: 60,
	});
	if (!res) return jsonFail(500, 'Failed to generate upload URL');
	await presigned.insert({ bucketUrl: keyController.transform.keyToS3Url(key), userId: user.id, key });

	return jsonOk<GetRes>({ bucketUrl: res.bucketUrl, formDataFields: res.formDataFields, objectKey: key });
};

const checkAndSaveUploadedAvatar = async (event: RequestEvent) => {
	const { request, locals } = event;
	const { user } = await locals.seshHandler.userOrRedirect();

	const body = await request.json().catch(() => null);
	const parsed = putReqSchema.safeParse(body);
	if (!parsed.success) return jsonFail(400);

	const rateCheck = await uploadLimiter.check(event, { log: { userId: user.id } });
	if (rateCheck.forbidden) return jsonFail(403);
	if (rateCheck.limiterKind === 'global')
		return jsonFail(
			429,
			`This demo has hit its 24h max. Please try again in ${toHumanReadableTime(rateCheck.retryAfterSec)}`,
		);
	if (rateCheck.limited) return jsonFail(429, rateCheck.humanTryAfter('uploads'));

	const presignedObjectUrl = await presigned.get({ userId: user.id });
	if (!presignedObjectUrl) return jsonFail(400);
	if (presignedObjectUrl.created.getTime() < Date.now() - 1000 * 60) {
		await presigned.delete({ userId: user.id });
		return jsonFail(400);
	}

	const cloudfrontUrl = keyController.transform.s3UrlToCloudfrontUrl(presignedObjectUrl.bucketUrl);
	const imageExists = await fetch(cloudfrontUrl, { method: 'HEAD' }).then((res) => res.ok);
	if (!imageExists) {
		await presigned.delete({ userId: user.id });
		return jsonFail(400);
	}

	const newAvatar = { crop: parsed.data.crop, url: cloudfrontUrl };
	const oldAvatar = user.avatar;
	const newKey = keyController.transform.s3UrlToKey(presignedObjectUrl.bucketUrl);

	const { error: moderationError } = await detectModerationLabels({ s3Key: newKey });

	if (moderationError) {
		await Promise.all([deleteS3Object({ key: newKey, guard: null }), presigned.delete({ userId: user.id })]);
		return jsonFail(422, moderationError.message);
	}

	if (keyController.is.cloudfrontUrl(oldAvatar?.url) && newAvatar.url !== oldAvatar.url) {
		const oldKey = keyController.transform.cloudfrontUrlToKey(oldAvatar.url);
		await Promise.all([
			deleteS3Object({ key: oldKey, guard: () => keyController.guard.user.avatar({ key: oldKey, ownerId: user.id }) }),
			invalidateCloudfront({ keys: [oldKey] }),
		]);
	}

	await Promise.all([
		presigned.delete({ userId: user.id }),
		db.update(users).set({ avatar: newAvatar }).where(eq(users.id, user.id)),
	]);

	return jsonOk<PutRes>({ savedImg: newAvatar });
};

const deleteAvatar = async ({ locals }: RequestEvent) => {
	const { user } = await locals.seshHandler.userOrRedirect();
	if (!user.avatar) return jsonFail(404, 'No avatar to delete');

	const promises: Array<Promise<unknown>> = [db.update(users).set({ avatar: null }).where(eq(users.id, user.id))];

	if (keyController.is.cloudfrontUrl(user.avatar.url)) {
		const key = keyController.transform.cloudfrontUrlToKey(user.avatar.url);
		promises.push(
			deleteS3Object({ key, guard: () => keyController.guard.user.avatar({ key, ownerId: user.id }) }),
			invalidateCloudfront({ keys: [key] }),
		);
	}

	await Promise.all(promises);

	return jsonOk<PutRes>({ savedImg: null });
};

export const GET: RequestHandler = getSignedAvatarUploadUrl;
export const PUT: RequestHandler = checkAndSaveUploadedAvatar;
export const DELETE: RequestHandler = deleteAvatar;
