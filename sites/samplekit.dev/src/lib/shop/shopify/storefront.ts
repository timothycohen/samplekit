import { createStorefrontApiClient, type StorefrontApiClient } from '@shopify/storefront-api-client';
import {
	PUBLIC_SHOPIFY_API_VERSION,
	PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN,
	PUBLIC_SHOPIFY_STORE_DOMAIN,
} from '$env/static/public';

export const getStorefront = (() => {
	let publicStorefront: StorefrontApiClient | null = null;

	const get = () => {
		if (publicStorefront) return publicStorefront;

		publicStorefront = createStorefrontApiClient({
			storeDomain: PUBLIC_SHOPIFY_STORE_DOMAIN,
			apiVersion: PUBLIC_SHOPIFY_API_VERSION,
			publicAccessToken: PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN,
		});

		return publicStorefront;
	};

	return get;
})();
