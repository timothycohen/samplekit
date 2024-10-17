import { type ClientResponse } from '@shopify/storefront-api-client';
import {
	PUBLIC_SHOPIFY_API_VERSION,
	PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN,
	PUBLIC_SHOPIFY_STORE_DOMAIN,
} from '$env/static/public';
import type {
	GeneratedQueryTypes,
	GeneratedMutationTypes,
} from '$generated/shopify-graphql-types/storefront.generated';

const url = PUBLIC_SHOPIFY_STORE_DOMAIN + '/api/' + PUBLIC_SHOPIFY_API_VERSION + '/graphql.json';

const method = 'POST';

const headers = {
	'Content-Type': 'application/json',
	Accept: 'application/json',
	'X-Shopify-Storefront-Access-Token': PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN,
};

type Generated = GeneratedQueryTypes & GeneratedMutationTypes;

export const requestStorefront = async <Operation extends keyof Generated>({
	operation,
	variables,
	fetch,
}: {
	operation: Operation;
	variables?: Generated[Operation]['variables'];
	fetch: Fetch;
}): Promise<ClientResponse<Generated[Operation]['return']>> => {
	let body: string;
	try {
		body = JSON.stringify({ query: operation, variables });
	} catch {
		return { errors: { message: 'Failed to stringify operation or variables.' } };
	}

	let response: Response;
	try {
		response = await fetch(url, { method, headers, body });
	} catch {
		return { errors: { message: 'Unable to fetch storefront.' } };
	}

	const { status, statusText } = response;
	if (!response.ok) {
		return { errors: { networkStatusCode: status, message: statusText, response } };
	}

	let clientResponse;
	try {
		clientResponse = await response.json();
	} catch {
		return { errors: { message: 'Failed to parse JSON response.' } };
	}

	return clientResponse;
};
