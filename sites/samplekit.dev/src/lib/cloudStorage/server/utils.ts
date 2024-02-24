import crypto from 'crypto';
import { CLOUDFRONT_URL, DB_NAME, S3_BUCKET_URL } from '$env/static/private';

const createId = ({ length }: { length: number } = { length: 16 }) =>
	crypto
		.randomBytes(Math.ceil(length / 2))
		.toString('base64url')
		.slice(0, length);

export const keyController = (() => {
	const transform = {
		keyToS3Url: (key: string) => `${S3_BUCKET_URL}/${key}`,
		keyToCloudfrontUrl: (key: string) => `${CLOUDFRONT_URL}/${key}`,
		s3UrlToKey: (url: string) => url.replace(`${S3_BUCKET_URL}/`, ''),
		s3UrlToCloudfrontUrl: (url: string) => url.replace(S3_BUCKET_URL, CLOUDFRONT_URL),
		cloudfrontUrlToKey: (url: string) => url.replace(`${CLOUDFRONT_URL}/`, ''),
		cloudfrontUrlToS3Url: (url: string) => url.replace(CLOUDFRONT_URL, S3_BUCKET_URL),
	};

	const is = {
		s3Url: (url?: string): url is string => !!url?.startsWith(S3_BUCKET_URL),
		cloudfrontUrl: (url?: string): url is string => !!url?.startsWith(CLOUDFRONT_URL),
	};

	const create = {
		root: () => `${DB_NAME}/`,
		user: {
			avatar: ({ userId }: { userId: string }) => `${DB_NAME}/user/${userId}/avatar/${createId()}`,
		},
	};

	const parse = {
		root: (key: string) => {
			const [dbName] = key.split('/');
			if (!dbName) return null;
			return { dbName };
		},
		user: {
			avatar: (key: string) => {
				const [dbName, _user, userId, _avatar, id] = key.split('/');
				if (!dbName || _user !== 'user' || !userId || _avatar !== 'avatar' || !id) return null;
				return { userId, id, dbName };
			},
		},
	};

	const guard = {
		root: ({ key }: { key: string }) => {
			const parsed = parse.root(key);
			if (!parsed) return false;
			return parsed.dbName === DB_NAME;
		},
		user: {
			avatar: ({ key, ownerId }: { key: string; ownerId: string }): boolean => {
				const parsed = parse.user.avatar(key);
				if (!parsed) return false;
				const { dbName, userId } = parsed;
				if (ownerId !== userId) return false;
				if (dbName !== DB_NAME) return false;
				return true;
			},
		},
	};

	return {
		transform,
		is,
		create,
		parse,
		guard,
	};
})();
