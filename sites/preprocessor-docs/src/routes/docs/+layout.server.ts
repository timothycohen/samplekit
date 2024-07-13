import toc from '$lib/generated/toc.json';
import { getOnServer } from '$lib/nav';

export const load = async ({ cookies }) => {
	return { initialSidebarState: getOnServer(cookies), toc };
};
