import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async () => {
	const meta: App.PageData['meta'] = { title: 'Register MFA | SampleKit' };

	return { meta };
};
