import { createClientFetch } from '$lib/http/client';
import type { Result } from '$lib/utils/common';
import type { RouteId } from './$types';
import type { startPasskeyReg } from '@samplekit/auth/client';

export type PostReq = { passkeyData: NonNullable<Awaited<ReturnType<typeof startPasskeyReg>>['data']> };

export const registerMFA_Passkey_WithSeshConfAndPasskey = createClientFetch<RouteId, Result.Success, PostReq>(
	'POST',
	'/(auth)/mfa/update/register/passkeys.json',
);
