import { checkedRedirect } from '$lib/http/server';

export const load = async () => {
	return checkedRedirect('/login', 301);
};
