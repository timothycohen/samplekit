import { PUBLIC_ORIGIN } from '$env/static/public';

export const GET = () => {
	return new Response(
		`User-agent: *
Sitemap: ${PUBLIC_ORIGIN}/sitemap.xml`,
		{
			headers: {
				'Cache-Control': 'public, max-age=86400',
				'Content-Type': 'text/plain',
			},
		},
	);
};
