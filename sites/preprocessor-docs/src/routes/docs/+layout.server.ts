import { getOnServer } from '$lib/nav';
import toc from './generated/toc';

export const load = async ({ cookies }) => {
	return {
		initialSidebarState: getOnServer(cookies),
		toc,
	};
};
