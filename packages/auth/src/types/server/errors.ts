export declare namespace TokenErr {
	export type Val = 'invalid_token' | 'expired_token';
	export type LimAtt = 'max_attempts';
	export type LimSend = 'send_max' | 'send_timeout';
	export type All = Val | LimAtt | LimSend;
}
