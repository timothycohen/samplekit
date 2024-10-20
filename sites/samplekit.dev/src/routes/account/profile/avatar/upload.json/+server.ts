import { db } from '$lib/db/server';
import { jsonFail, jsonOk, parseReqJson } from '$lib/http/server';
import { objectStorage } from '$lib/object-storage/server';
import { createLimiter } from '$lib/rate-limit/server';
import { toHumanReadableTime } from '$lib/utils/common';
import { MAX_UPLOAD_SIZE, putReqSchema, type GetRes, type PutRes } from '.';
import type { RequestHandler } from '@sveltejs/kit';

// generateS3UploadPost enforces max upload size and denies any upload that we don't sign
// uploadLimiter rate limits the number of uploads a user can do
// presigned ensures we don't have to trust the client to tell us what the uploaded objectUrl is after the upload
// unsavedUploadCleaner ensures that we don't miss cleaning up an object in S3 if the user doesn't notify us of the upload
// detectModerationLabels prevents explicit content

const EXPIRE_SECONDS = 60;

const uploadLimiter = createLimiter({
	id: 'checkAndSaveUploadedAvatar',
	limiters: [
		{ kind: 'global', rate: [300, 'd'] },
		{ kind: 'userId', rate: [2, '15m'] },
		{ kind: 'ipUa', rate: [3, '15m'] },
	],
});

const unsavedUploadCleaner = objectStorage.createUnsavedUploadCleaner({
	jobDelaySeconds: EXPIRE_SECONDS,
	getStoredUrl: async ({ userId }) => (await db.user.get({ userId }))?.avatar?.url,
});

const getSignedAvatarUploadUrl: RequestHandler = async (event) => {
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

	const key = objectStorage.keyController.create.user.avatar({ userId: user.id });
	const res = await objectStorage.generateUploadFormDataFields({
		key,
		maxContentLength: MAX_UPLOAD_SIZE,
		expireSeconds: EXPIRE_SECONDS,
	});
	if (!res) return jsonFail(500, 'Failed to generate upload URL');
	await db.presigned.insertOrOverwrite({
		url: objectStorage.keyController.transform.keyToObjectUrl(key),
		userId: user.id,
		key,
	});
	unsavedUploadCleaner.addDelayedJob({
		cdnUrl: objectStorage.keyController.transform.keyToCDNUrl(key),
		userId: user.id,
	});

	return jsonOk<GetRes>({ url: res.url, formDataFields: res.formDataFields, objectKey: key });
};

const checkAndSaveUploadedAvatar: RequestHandler = async ({ request, locals }) => {
	const { user } = await locals.seshHandler.userOrRedirect();

	const body = await parseReqJson(request, putReqSchema);
	if (!body.success) return jsonFail(400);

	const presignedObjectUrl = await db.presigned.get({ userId: user.id });
	if (!presignedObjectUrl) return jsonFail(400);

	const cdnUrl = objectStorage.keyController.transform.objectUrlToCDNUrl(presignedObjectUrl.url);
	const imageExists = await fetch(cdnUrl, { method: 'HEAD' }).then((res) => res.ok);
	if (!imageExists) {
		await db.presigned.delete({ userId: user.id });
		unsavedUploadCleaner.removeJob({ cdnUrl });
		return jsonFail(400);
	}

	const newAvatar = { crop: body.data.crop, url: cdnUrl };
	const oldAvatar = user.avatar;
	const newKey = objectStorage.keyController.transform.objectUrlToKey(presignedObjectUrl.url);

	const { error: moderationError } = await objectStorage.detectModerationLabels({ s3Key: newKey });

	if (moderationError) {
		unsavedUploadCleaner.removeJob({ cdnUrl });
		await Promise.all([objectStorage.delete({ key: newKey, guard: null }), db.presigned.delete({ userId: user.id })]);
		return jsonFail(422, moderationError.message);
	}

	if (objectStorage.keyController.is.cdnUrl(oldAvatar?.url) && newAvatar.url !== oldAvatar.url) {
		const oldKey = objectStorage.keyController.transform.cdnUrlToKey(oldAvatar.url);
		await Promise.all([
			objectStorage.delete({
				key: oldKey,
				guard: () => objectStorage.keyController.guard.user.avatar({ key: oldKey, ownerId: user.id }),
			}),
			objectStorage.invalidateCDN({ keys: [oldKey] }),
		]);
	}

	unsavedUploadCleaner.removeJob({ cdnUrl });
	await Promise.all([
		db.presigned.delete({ userId: user.id }),
		db.user.update({ userId: user.id, values: { avatar: newAvatar } }),
	]);

	return jsonOk<PutRes>({ savedImg: newAvatar });
};

const deleteAvatar: RequestHandler = async ({ locals }) => {
	const { user } = await locals.seshHandler.userOrRedirect();
	if (!user.avatar) return jsonFail(404, 'No avatar to delete');

	const promises: Array<Promise<unknown>> = [db.user.update({ userId: user.id, values: { avatar: null } })];

	if (objectStorage.keyController.is.cdnUrl(user.avatar.url)) {
		const key = objectStorage.keyController.transform.cdnUrlToKey(user.avatar.url);
		promises.push(
			objectStorage.delete({
				key,
				guard: () => objectStorage.keyController.guard.user.avatar({ key, ownerId: user.id }),
			}),
			objectStorage.invalidateCDN({ keys: [key] }),
		);
	}

	await Promise.all(promises);

	return jsonOk<PutRes>({ savedImg: null });
};

export const GET = getSignedAvatarUploadUrl;
export const PUT = checkAndSaveUploadedAvatar;
export const DELETE = deleteAvatar;
