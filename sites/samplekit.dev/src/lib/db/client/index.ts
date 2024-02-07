import { z } from 'zod';

export const cropSchema = z
	.object({
		position: z.object({ x: z.number(), y: z.number() }),
		aspect: z.number(),
		rotation: z.number(),
		scale: z.number(),
	})
	.default({ position: { x: 0, y: 0 }, aspect: 1, rotation: 0, scale: 1 });

export const croppedImgSchema = z.object({
	url: z.string().url(),
	crop: cropSchema,
});

export type CroppedImg = z.infer<typeof croppedImgSchema>;
export type ImgCrop = z.infer<typeof croppedImgSchema>['crop'];

export const mfaKinds = ['authenticator', 'passkeys', 'sms'] as const;
export const mfaLabels: Record<DB.MFAs.Kind, string> = {
	sms: 'SMS',
	passkeys: 'Passkey / Biometric',
	authenticator: 'Authenticator App',
};
