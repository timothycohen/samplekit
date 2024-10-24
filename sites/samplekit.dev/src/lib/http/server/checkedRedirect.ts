import { redirect } from '@sveltejs/kit';
import type { LayoutRouteId } from '../../../routes/$types';

type Replace<
	T extends string,
	S extends string,
	D extends string,
	A extends string = '',
> = T extends `${infer L}${S}${infer R}` ? Replace<R, S, D, `${A}${L}${D}`> : `${A}${T}`;

type ReplaceExact<T extends string, S extends string, D extends string> = T extends S ? D : T;

type RouteId = NonNullable<LayoutRouteId>;
type AuthRemoved = Replace<RouteId, '/(auth)', ''>;
type LoginRemoved = Replace<AuthRemoved, '/(login-signup)', ''>;
// prettier-ignore
type UpdateReplaced = ReplaceExact<LoginRemoved,'/mfa/update', `/mfa/update?next=${'register' | 'remove'}-${DB.MFAs.Kind}`>;
type MFAKindReplaced = Replace<UpdateReplaced, '[mfaKind=mfaKinds]', `${DB.MFAs.Kind}`>;
type TokenReplaced = Replace<MFAKindReplaced, '[token]', string>;
export type CheckedRoute = TokenReplaced;

// This is a nicety which throws compile errors if a redirect was not updated correctly during a refactor
export const checkedRedirect = (routeId: CheckedRoute, status?: 300 | 301 | 303 | 304 | 305 | 306 | 307 | 308) => {
	return redirect(status ?? 302, routeId);
};
