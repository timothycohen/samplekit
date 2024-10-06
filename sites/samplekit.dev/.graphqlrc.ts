import { ApiType, shopifyApiProject } from '@shopify/api-codegen-preset';

export default {
	// For syntax highlighting / auto-complete when writing operations
	schema: 'https://shopify.dev/admin-graphql-direct-proxy/2024-10',
	documents: ['./lib/**/*.{js,ts,jsx,tsx}'],
	projects: {
		// To produce variable / return types for Shopify Storefront API operations
		default: shopifyApiProject({
			apiType: ApiType.Storefront,
			apiVersion: '2024-10',
			documents: ['./src/lib/**/*.{js,ts,jsx,tsx}'],
			outputDir: './generated/shopify-graphql-types',
		}),
	},
	ignoreNoDocuments: true,
};
