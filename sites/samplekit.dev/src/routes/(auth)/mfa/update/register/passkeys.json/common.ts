import { registrationResponseJSONSchema } from '$lib/auth/common';
import type { Result } from '$lib/utils/common';
import type { z } from 'zod';

export const registerMFA_Passkey_WithSeshConfAndPasskeyReqSchema = registrationResponseJSONSchema;
export type RegisterMFA_Passkey_WithSeshConfAndPasskeyReq = z.infer<
	typeof registerMFA_Passkey_WithSeshConfAndPasskeyReqSchema
>;
export type RegisterMFA_Passkey_WithSeshConfAndPasskeyRes = Result.Success;
