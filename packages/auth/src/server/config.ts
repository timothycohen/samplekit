import { randomBytes, scrypt, timingSafeEqual } from 'crypto';
import { customAlphabet, nanoid } from 'nanoid';
// eslint-disable-next-line
// @ts-ignore cjs only
import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import type { DefaultConfig } from '../types/server/config.js';

const hashScrypt = (password: string): Promise<string> => {
	return new Promise((resolve, reject) => {
		const salt = randomBytes(16).toString('hex');

		scrypt(password, salt, 64, (err, derivedKey) => {
			if (err) reject(err);
			const version = 'cs'; // crypto-scrypt
			resolve(`${version}:${salt}:${derivedKey.toString('hex')}`);
		});
	});
};

const verifyScrypt = (password: string, hash: string): Promise<boolean> => {
	return new Promise((resolve, reject) => {
		if (typeof password !== 'string' || typeof hash !== 'string') return resolve(false);
		const [version, salt, hashKey] = hash.split(':');
		if (!salt || !hashKey || version !== 'cs') return resolve(false);

		const hashKeyBuff = Buffer.from(hashKey, 'hex');
		scrypt(password, salt, 64, (err, derivedKey) => {
			if (err) reject(err);
			resolve(timingSafeEqual(hashKeyBuff, derivedKey));
		});
	});
};

export const createConfigDefaults = ({ authenticatorName }: { authenticatorName: string }): DefaultConfig => {
	const timeoutMs = { 1: 30000, 2: 40000, 3: 60000, 4: 90000, 5: 120000, max: 600000 };
	const maxSend = 5;
	const ALPHABET: Record<string, string> & { default: string } = {
		lowerAlphaNumeric: 'abcdefghijklmnopqrstuvwxyz1234567890',
		number: '1234567890',
		default: 'abcdefghijklmnopqrstuvwxyz1234567890',
	};

	return {
		clean: {
			email: (email: string) => email.trim().toLowerCase(),
		},
		generateOAuthState: () => nanoid(),
		generateOAuthCookieNames: (providerName: string) => ({
			state: `oauth_state_${providerName}`,
			isPersistentSession: `oauth_persistent_${providerName}`,
		}),
		passkeyTimeout: 60000,
		passwordHash: {
			generate: hashScrypt,
			validate: verifyScrypt,
		},
		randomString: {
			alphabet: ALPHABET,
			generate: ({ alphabet, size }) => customAlphabet(ALPHABET[alphabet] ?? ALPHABET['default'])(size),
		},
		generateId: () => nanoid(),
		authenticator: {
			generateSecret: () => authenticator.generateSecret(),
			generateToken: ({ secret }) => authenticator.generate(secret),
			keyuri: ({ email, secret }) => authenticator.keyuri(email, authenticatorName, secret),
			createDataUrl: async ({ setupOtpUri }) =>
				await new Promise<string | null>((resolve) => {
					QRCode.toDataURL(setupOtpUri, (err, imageUrl) => {
						if (err) {
							resolve(null);
						} else {
							resolve(imageUrl);
						}
					});
				}),
		},
		tokenMaxVeriAttempts: 5,
		tokenExpiryTimes: {
			email_veri: 1000 * 60 * 60 * 24 * 14, // two weeks
			pw_reset: 1000 * 60 * 30, // 30 minutes
			sms_veri: 1000 * 60 * 10, // 10 minutes
			setup_sms_veri: 1000 * 60 * 10, // 10 minutes
			setup_authenticator: 1000 * 60 * 10, // 10 minutes
			passkey_challenge: 1000 * 60, // 1 minute
		},
		tokenLimSend: {
			email_veri: { size: 63, alphabet: 'lowerAlphaNumeric', maxSend, timeoutMs },
			pw_reset: { size: 63, alphabet: 'lowerAlphaNumeric', maxSend, timeoutMs },
			sms_veri: { size: 6, alphabet: 'number', maxSend, timeoutMs },
			setup_sms_veri: { size: 6, alphabet: 'number', maxSend, timeoutMs },
		},
	};
};
