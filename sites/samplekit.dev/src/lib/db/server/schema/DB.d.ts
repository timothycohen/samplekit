import type { ProviderNS, ProviderT, MFAsT, MFAsNS } from './userAndAuth/provider';
import type { SessionT } from './userAndAuth/session';
import type { TokenNS } from './userAndAuth/tokens';
import type { UserT } from './userAndAuth/user';

declare global {
	namespace DB {
		export type Session = SessionT;
		export import Token = TokenNS;
		export type User = UserT;
		export type Provider = ProviderT;
		export import Provider = ProviderNS;
		export type MFAs = MFAsT;
		export import MFAs = MFAsNS;
	}
}

export {};
