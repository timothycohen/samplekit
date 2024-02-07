import { eq } from 'drizzle-orm';
import { CLOUDFRONT_URL, S3_BUCKET_URL } from '$env/static/private';
import { deleteS3Object, invalidateCloudfront, setS3Metadata, urlTransforms } from '$lib/cloudStorage/server';
import { detectModerationLabels } from '$lib/cloudStorage/server';
import { db, users } from '$lib/db/server';
import { jsonFail, jsonOk } from '$lib/http/server';
import { putReqSchema, type PutRes } from '.';
import type { RequestHandler } from './$types';
import type { RequestEvent } from '@sveltejs/kit';

const checkAndSaveUploadedAvatar = async ({ locals, request }: RequestEvent) => {
	const { user } = await locals.seshHandler.userOrRedirect();

	const body = await request.json().catch(() => null);
	const parsed = putReqSchema.safeParse(body);
	if (!parsed.success) return jsonFail(400);

	const s3Url = parsed.data.s3ObjectUrl;
	if (!s3Url.startsWith(S3_BUCKET_URL)) return jsonFail(400);
	const cloudfrontUrl = urlTransforms.s3UrlToCloudfrontUrl(s3Url);
	const key = urlTransforms.s3UrlToKey(s3Url);
	const imageExists = await fetch(cloudfrontUrl, { method: 'HEAD' }).then((res) => res.ok);
	if (!imageExists) return jsonFail(400);

	const avatar = { crop: parsed.data.crop, url: cloudfrontUrl };

	const { error: moderationError } = await detectModerationLabels({ s3Key: key });
	if (moderationError) {
		await deleteS3Object({ key, disregardEnv: true });
		return jsonFail(422, moderationError.message);
	}

	if (user.avatar && user.avatar.url.startsWith(CLOUDFRONT_URL) && avatar.url !== user.avatar.url) {
		await Promise.all([deleteS3Object({ key }), invalidateCloudfront({ keys: [key] })]);
	}

	await Promise.all([
		db.update(users).set({ avatar }).where(eq(users.id, user.id)),
		setS3Metadata({ key, tags: { user_id: user.id, kind: 'avatar' } }),
	]);

	return jsonOk<PutRes>({ savedImg: avatar });
};

const deleteAvatar = async ({ locals }: RequestEvent) => {
	const { user } = await locals.seshHandler.userOrRedirect();
	if (!user.avatar) return jsonFail(404, 'No avatar to delete');

	const promises: Array<Promise<unknown>> = [db.update(users).set({ avatar: null }).where(eq(users.id, user.id))];

	if (user.avatar.url.startsWith(CLOUDFRONT_URL)) {
		const key = urlTransforms.cloudfrontUrlToKey(user.avatar.url);
		promises.push(deleteS3Object({ key }), invalidateCloudfront({ keys: [key] }));
	}

	await Promise.all(promises);

	return jsonOk<PutRes>({ savedImg: null });
};

export const PUT: RequestHandler = checkAndSaveUploadedAvatar;
export const DELETE: RequestHandler = deleteAvatar;
