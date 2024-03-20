import { mfaKinds } from '$lib/auth/client';
import type { ParamMatcher } from '@sveltejs/kit';

export const match: ParamMatcher = (param: string): param is (typeof mfaKinds)[number] =>
	mfaKinds.includes(param as (typeof mfaKinds)[number]);
