import { PUBLIC_ORIGIN } from '$env/static/public';
import { allPostData } from '$lib/articles/load';
import { shop } from '$lib/shop';

/** https://www.sitemaps.org/protocol.html */
type SiteMapUrl = {
	loc: string;
	lastmod?: string;
	changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
	priority?: number;
};

export const GET = async ({ fetch }) => {
	const rootUrls = ['/login', '/signup'].map((p) => ({
		loc: `${PUBLIC_ORIGIN}${p}`,
	})) satisfies SiteMapUrl[];

	const articleUrls = allPostData.map((post) => ({
		loc: `${PUBLIC_ORIGIN}${post.articlePath}`,
		lastmod: (post.updates?.[0]?.at ?? post.publishedAt).toString(),
	})) satisfies SiteMapUrl[];

	const shopUrls = [
		'/shop',
		'/shop/collections',
		'/shop/collections/all',
		...(await shop.collection.getAll({ fetch })).map((c) => `/shop/collections/${c.handle}`),
		...(await shop.product.getAll({ fetch, filters: {} })).map((p) => `/shop/product/${p.handle}`),
	].map((p) => ({ loc: `${PUBLIC_ORIGIN}${p}` })) satisfies SiteMapUrl[];

	return new Response(render([...rootUrls, ...articleUrls, ...shopUrls]), {
		headers: {
			'Cache-Control': 'max-age=0, s-maxage=3600',
			'Content-Type': 'application/xml',
		},
	});
};

const render = (sitemapUrls: SiteMapUrl[]) => `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd"
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
  xmlns:video="http://www.google.com/schemas/sitemap-video/1.1"
  xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
  xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"
  xmlns:pagemap="http://www.google.com/schemas/sitemap-pagemap/1.0"
  xmlns:xhtml="http://www.w3.org/1999/xhtml"
>
${sitemapUrls
	.map(
		(url) => `    <url>
			${url.loc ? `<loc>${url.loc}</loc>` : ''}
			${url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : ''}
			${url.changefreq ? `<changefreq>${url.changefreq}</changefreq>` : ''}
			${url.priority ? `<priority>${url.priority}</priority>` : ''}
    </url>`,
	)
	.join('\n')}
</urlset>`;
