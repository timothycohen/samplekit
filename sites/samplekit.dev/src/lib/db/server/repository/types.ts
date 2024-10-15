import type { DbAdapter } from '@samplekit/auth/server';

export type DBRepository = {
	presigned: {
		insertOrOverwrite: (a: DB.PresignedUrl.Set) => Promise<void>;
		get: (a: { userId: string }) => Promise<DB.PresignedUrl | undefined>;
		delete: (a: { userId: string }) => Promise<void>;
	};
	meta: {
		resetDb: () => Promise<void>;
	};
	user: {
		get: (a: { userId: string }) => Promise<DB.User | undefined>;
		update: (a: { userId: string; values: Partial<DB.User> }) => Promise<void>;
	};
};

export type AuthAdapter = DbAdapter<
	DB.User,
	DB.Provider,
	Omit<DB.Provider, 'hashedPassword'>,
	DB.Session,
	void,
	void,
	{ os: string | null; browser: string | null; ip: string | null }
>;
