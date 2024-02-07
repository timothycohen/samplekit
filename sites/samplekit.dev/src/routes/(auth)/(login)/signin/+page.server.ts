import { checkedRedirect } from '$lib/http/server';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	return checkedRedirect('/login', 301);
};
