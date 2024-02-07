import type { ParamMatcher } from '@sveltejs/kit';

export const match: ParamMatcher = (param: string): param is 'google' | 'github' =>
	['google', 'github'].includes(param);
