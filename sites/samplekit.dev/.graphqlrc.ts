import { ApiType, shopifyApiProject } from '@shopify/api-codegen-preset';

export default {
	// For syntax highlighting / auto-complete when writing operations
	schema: 'https://shopify.dev/admin-graphql-direct-proxy/2023-10',
	documents: ['./lib/**/*.{js,ts,jsx,tsx}'],
	projects: {
		// To produce variable / return types for Admin API operations
		default: shopifyApiProject({
			apiType: ApiType.Storefront,
			apiVersion: '2023-10',
			documents: ['./src/lib/**/*.{js,ts,jsx,tsx}'],
			outputDir: './generated/shopify-graphql-types',
		}),
	},
	ignoreNoDocuments: true,
};
