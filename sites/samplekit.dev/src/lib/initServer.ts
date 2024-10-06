import { building, dev } from '$app/environment';
import { AWS_SERVICE_REGION, IAM_ACCESS_KEY_ID, IAM_SECRET_ACCESS_KEY } from '$env/static/private';
import {
	PUBLIC_ORIGIN,
	PUBLIC_SHOPIFY_API_VERSION,
	PUBLIC_SHOPIFY_STORE_DOMAIN,
	PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN,
	PUBLIC_TURNSTILE_SITE_KEY,
} from '$env/static/public';
import { getS3, getRekognition, getCloudfront } from '$lib/cloudStorage/server';
import { migrateDb, dbConnectedOrExit } from '$lib/db/server/connect';
import { kv } from '$lib/kv/server';
import { getBrowserLogflare } from '$lib/logging/client/logger';
import { initSentry, getServerLogflare, setupLogger } from '$lib/logging/server';
import { shopConnectedOrExit } from '$lib/shop/connectedOrExit.server';
import { INTERCEPT_TRANSPORTS, getTwilio, getSES } from '$lib/transport/server';

getServerLogflare();
initSentry();

setupLogger.info(`SvelteKit dev mode: ${dev}.`);
setupLogger.info(`SvelteKit building: ${building}.`);
setupLogger.info(`Vite mode: ${import.meta.env.MODE}.`);
setupLogger.info(`Email and SMS are ${INTERCEPT_TRANSPORTS ? 'blocked. Routing to console.' : 'active.'}`);
if (!PUBLIC_TURNSTILE_SITE_KEY) setupLogger.warn('Turnstile site key is not set. Auth pages will not work.');

if (!PUBLIC_ORIGIN) {
	setupLogger.fatal(`PUBLIC_ORIGIN is not set.`);
	process.exit(1);
} else {
	setupLogger.info(`Origin is ${PUBLIC_ORIGIN}`);
}

if (!AWS_SERVICE_REGION) {
	setupLogger.fatal(`AWS_SERVICE_REGION is not set.`);
	process.exit(1);
} else {
	if (!IAM_ACCESS_KEY_ID && !IAM_SECRET_ACCESS_KEY) {
		setupLogger.warn(`IAM_ACCESS_KEY_ID and IAM_SECRET_ACCESS_KEY are not set. AWS services will fail at runtime.`);
	} else if (!IAM_ACCESS_KEY_ID) {
		setupLogger.warn(`IAM_ACCESS_KEY_ID is not set. AWS services will fail at runtime.`);
	} else if (!IAM_SECRET_ACCESS_KEY) {
		setupLogger.warn(`IAM_SECRET_ACCESS_KEY is not set. AWS services will fail at runtime.`);
	} else {
		getCloudfront();
		setupLogger.info('AWS CloudFrontClient created (credentials have not been verified).');
		getRekognition();
		setupLogger.info('AWS RekognitionClient created (credentials have not been verified).');
		getS3();
		setupLogger.info('AWS S3Client created (credentials have not been verified).');
		getSES();
		setupLogger.info('AWS SESClient created (credentials have not been verified).');
	}
}
if (getTwilio()) setupLogger.info('TwilioClient created (credentials have not been verified).');
else setupLogger.error('TwilioClient init failure.');

if (!PUBLIC_SHOPIFY_API_VERSION || !PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN || !PUBLIC_SHOPIFY_STORE_DOMAIN) {
	if (!PUBLIC_SHOPIFY_API_VERSION) setupLogger.fatal(`PUBLIC_SHOPIFY_API_VERSION is not set.`);
	if (!PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN) setupLogger.fatal(`PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN is not set.`);
	if (!PUBLIC_SHOPIFY_STORE_DOMAIN) setupLogger.fatal(`PUBLIC_SHOPIFY_STORE_DOMAIN is not set.`);
	process.exit(1);
}

await Promise.all([kv.connectOrExit(), dbConnectedOrExit(), shopConnectedOrExit()]);
await migrateDb();

if (getBrowserLogflare()) setupLogger.info('Logflare for browser created.');
else setupLogger.warn('Logflare for browser init failure.');
