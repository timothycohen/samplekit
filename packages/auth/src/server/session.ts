import type { Auth, Config, DbAdapterSession, TransformSession, ServerAuthSession } from '../types/server/index.js';

export const createAuthSession: <S, SCtx>(a: {
	dbSession: DbAdapterSession<S>;
	transformSession: TransformSession<S, SCtx>;
	config: Config;
}) => ServerAuthSession<S, SCtx> = ({ config, dbSession, transformSession }) => {
	return {
		create: async ({ userId, awaitingMFA, awaitingEmailVeri, persistent }, passToTransformSession) => {
			const activeExpires = new Date(Date.now() + config.sessionExpiresIn.activePeriod);
			const idleExpires = new Date(activeExpires.getTime() + config.sessionExpiresIn.idlePeriod);
			const res: Auth.Session = {
				id: config.generateId(),
				activeExpires,
				idleExpires,
				userId,
				awaitingMFA,
				awaitingEmailVeri,
				lastSeen: new Date(),
				login: new Date(),
				temporaryConfirmationExpires: new Date(),
				persistent,
			};
			await dbSession.insert(transformSession.toClient(res, passToTransformSession));
			return res;
		},
		delete: async ({ sessionId }: { sessionId: string }) => dbSession.deleteOne({ sessionId }),
		deleteOthers: async ({ sessionId, userId }: { sessionId: string; userId: string }) =>
			dbSession.deleteOthers({ sessionId, userId }),
		deleteAll: async ({ userId }: { userId: string }) => dbSession.deleteMany({ userId }),
		removeAwaitingMFA: async ({ sessionId }: { sessionId: string }) =>
			dbSession.update({ sessionId, values: { awaitingMFA: false } }),
		/** Default duration is 10 minutes */
		addTempConf: async ({ sessionId, duration }: { sessionId: string; duration?: number }) => {
			const temporaryConfirmationExpires = new Date(Date.now() + (duration ?? 1000 * 60 * 10));
			await dbSession.update({ sessionId, values: { temporaryConfirmationExpires } });
		},
		getAll: dbSession.getAll,
		removeTempConf: async ({ sessionId }: { sessionId: string }) => {
			await dbSession.update({ sessionId, values: { temporaryConfirmationExpires: new Date() } });
		},
		getTempConf: ({ session }: { session: Auth.Session }) => {
			const { temporaryConfirmationExpires } = session;
			if (!temporaryConfirmationExpires) return null;
			if (temporaryConfirmationExpires <= new Date()) return null;
			return Math.floor((temporaryConfirmationExpires.getTime() - Date.now()) / 1000 / 60);
		},
	};
};
