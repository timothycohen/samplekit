import { setupLogger } from '$lib/logging/server';
import { getShopNameQuery } from './gql';
import { requestStorefront } from './storefront';

export async function shopConnectedOrExit(): Promise<void> {
	const res = await requestStorefront({ operation: getShopNameQuery, fetch });
	if (res.errors) {
		setupLogger.fatal(
			'Storefront connection error. Please check the following env vars: PUBLIC_SHOPIFY_API_VERSION, PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN, PUBLIC_SHOPIFY_STORE_DOMAIN.',
		);
		process.exit(1);
	} else {
		setupLogger.info('Storefront connected successfully.');
	}
}
