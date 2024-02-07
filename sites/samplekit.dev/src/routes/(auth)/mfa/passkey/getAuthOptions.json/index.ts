import { createClientFetch } from '$lib/http/client';
import type { auth } from '$lib/auth/server';
import type { RouteId } from './$types';

export type GetRes = { opts: Awaited<ReturnType<typeof auth.provider.pass.MFA.passkey.createAuthOpts>> };

export const getPasskeyAuthOpts = createClientFetch<RouteId, GetRes>('GET', '/(auth)/mfa/passkey/getAuthOptions.json');
