import { z } from 'zod';

const responseJSONSchema = {
	id: z.string(),
	rawId: z.string(),
	authenticatorAttachment: z.enum(['cross-platform', 'platform']).optional(),
	clientExtensionResults: z.object({
		appid: z.boolean().optional(),
		credProps: z.object({ rk: z.boolean().optional() }).optional(),
		hmacCreateSecret: z.boolean().optional(),
	}),
	type: z.literal('public-key'),
};

export const authenticationResponseJSONSchema = z.object({
	passkeyData: z.object({
		response: z.object({
			authenticatorData: z.string(),
			clientDataJSON: z.string(),
			signature: z.string(),
			userHandle: z.string().optional(),
		}),
		...responseJSONSchema,
	}),
});

export const registrationResponseJSONSchema = z.object({
	passkeyData: z.object({
		response: z.object({
			clientDataJSON: z.string(),
			attestationObject: z.string(),
			authenticatorData: z.string().optional(),
			transports: z.array(z.enum(['ble', 'cable', 'hybrid', 'internal', 'nfc', 'smart-card', 'usb'])).optional(),
			publicKeyAlgorithm: z.number().optional(),
			publicKey: z.string().optional(),
		}),
		...responseJSONSchema,
	}),
});
