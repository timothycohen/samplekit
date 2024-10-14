import type { Auth } from '../auth.js';

export type ServerAuthSession<S, SCtx> = {
	create: (
		a: { userId: string; awaitingMFA: boolean; awaitingEmailVeri: boolean; persistent: boolean },
		passToTransformSession: SCtx,
	) => Promise<Auth.Session>;
	delete: (a: { sessionId: string }) => Promise<void>;
	deleteOthers: (a: { sessionId: string; userId: string }) => Promise<void>;
	deleteAll: (a: { userId: string }) => Promise<void>;
	removeAwaitingMFA: ({ sessionId }: { sessionId: string }) => Promise<void>;
	addTempConf: ({ sessionId, duration }: { sessionId: string; duration?: number }) => Promise<void>;
	getAll: ({ userId }: { userId: string }) => Promise<S[]>;
	removeTempConf: ({ sessionId }: { sessionId: string }) => Promise<void>;
	getTempConf: ({ session }: { session: Auth.Session }) => number | null;
};
