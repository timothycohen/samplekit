import { PUBLIC_ORIGIN } from '$env/static/public';

export const sanitizeRedirectUrl = (strOrForm: string | FormData | null | undefined): string | null => {
	if (!strOrForm) return null;
	const redirect_url = typeof strOrForm === 'string' ? strOrForm : strOrForm.get('redirect_url');
	if (typeof redirect_url === 'string' && (redirect_url.startsWith('/') || redirect_url.startsWith(PUBLIC_ORIGIN))) {
		return redirect_url;
	}
	return null;
};
