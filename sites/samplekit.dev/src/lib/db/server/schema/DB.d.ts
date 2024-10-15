import type { presignedUrls } from './presignedUrls';
import type { ProviderNS, ProviderT, MFAsT, MFAsNS } from './userAndAuth/provider';
import type { sessions } from './userAndAuth/session';
import type { TokenNS } from './userAndAuth/tokens';
import type { users } from './userAndAuth/user';

declare global {
	namespace DB {
		export type Session = typeof sessions.$inferSelect;
		export namespace Session {
			export type Set = typeof sessions.$inferInsert;
		}

		export type User = typeof users.$inferSelect;
		export namespace User {
			export type Set = typeof users.$inferInsert;
		}

		export type PresignedUrl = typeof presignedUrls.$inferSelect;
		export namespace PresignedUrl {
			export type Set = typeof presignedUrls.$inferInsert;
		}

		export import Token = TokenNS;
		export type Provider = ProviderT;
		export import Provider = ProviderNS;
		export type MFAs = MFAsT;
		export import MFAs = MFAsNS;
	}
}

export {};
