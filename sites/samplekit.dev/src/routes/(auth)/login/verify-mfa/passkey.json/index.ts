import { createClientFetch } from '$lib/http/client';
import type { Result } from '$lib/utils/common';
import type { RouteId } from './$types';
import type { startPasskeyAuth } from '@samplekit/auth/client';

export type PostReq = { passkeyData: NonNullable<Awaited<ReturnType<typeof startPasskeyAuth>>['data']> };

export const loginWithPasskey = createClientFetch<RouteId, Result.Success, PostReq>(
	'POST',
	'/(auth)/login/verify-mfa/passkey.json',
);
