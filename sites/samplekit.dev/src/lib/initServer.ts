import { PUBLIC_ORIGIN, PUBLIC_TURNSTILE_SITE_KEY } from '$env/static/public';
import { migrateDb, testDb } from '$lib/db/server/connect';
import { getServerLogflare, setupLogger } from '$lib/logging/server/logger';
import { getSentry } from '$lib/logging/server/sentry';
import { INTERCEPT_TRANSPORTS } from '$lib/transport/server/consts';
import { getCloudfront } from './cloudStorage/server/cloudfront';
import { getRekognition } from './cloudStorage/server/rekognition';
import { getS3 } from './cloudStorage/server/s3';
import { kv } from './kv/server';
import { getBrowserLogflare } from './logging/client/logger';
import { getStorefront } from './shop/shopify/storefront';
import { getSES } from './transport/server/email';
import { getTwilio } from './transport/server/sms';

// info / warn / error
if (!PUBLIC_ORIGIN) setupLogger.warn(`Origin is ${PUBLIC_ORIGIN}`);
else setupLogger.info(`Origin is ${PUBLIC_ORIGIN}`);

setupLogger.info(`Email and SMS are ${INTERCEPT_TRANSPORTS ? 'blocked. Routing to console.' : 'active.'}`);

if (!PUBLIC_TURNSTILE_SITE_KEY) setupLogger.warn('Turnstile site key is not set. Auth pages will not work.');

if (getServerLogflare()) setupLogger.info('Logflare for server created.');
else setupLogger.warn('Logflare for server init failure.');
if (getBrowserLogflare()) setupLogger.info('Logflare for browser created.');
else setupLogger.warn('Logflare for browser init failure.');
if (getSentry()) setupLogger.info('Sentry initialized on server.');
else setupLogger.warn('Sentry for server init failure.');
if (getTwilio()) setupLogger.info('TwilioClient created.');
else setupLogger.error('TwilioClient init failure.');

getCloudfront();
setupLogger.info('(unverified) CloudFrontClient created.');
getRekognition();
setupLogger.info('(unverified) RekognitionClient created.');
getS3();
setupLogger.info('(unverified) S3Client created.');
getSES();
setupLogger.info('(unverified) SESClient created.');

// fatal
await testDb();
await migrateDb();
await kv.connectOrExit();

try {
	getStorefront();
	setupLogger.info('Storefront client created.');
} catch (err) {
	if (err instanceof Error) setupLogger.fatal(`Storefront client init failure: ${err.message}`);
	else setupLogger.fatal(`Storefront client init failure.`);
	process.exit(1);
}
