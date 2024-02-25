import { PUBLIC_ORIGIN } from '$env/static/public';
import { migrateDb, testDb } from '$lib/db/server/connect';
import { getServerLogflare, setupLogger } from '$lib/logging/server/logger';
import { getSentry } from '$lib/logging/server/sentry';
import { INTERCEPT_TRANSPORTS } from '$lib/transport/server/consts';
import { getCloudfront } from './cloudStorage/server/cloudfront';
import { getRekognition } from './cloudStorage/server/rekognition';
import { getS3 } from './cloudStorage/server/s3';
import { getBrowserLogflare } from './logging/client/logger';
import { getStorefront } from './shop/shopify/storefront';
import { getSES } from './transport/server/email';
import { getTwilio } from './transport/server/sms';

await testDb();
await migrateDb();

getServerLogflare() && setupLogger.info('LogflareClient for server created.');
getBrowserLogflare() && setupLogger.info('LogflareClient for browser created.');
getSentry();

setupLogger.info(`Origin is ${PUBLIC_ORIGIN}`);

getStorefront() && setupLogger.info('Storefront client created.');

getCloudfront();
getRekognition();
getS3();

setupLogger.info(`Email and SMS are ${INTERCEPT_TRANSPORTS ? 'blocked. Routing to console.' : 'active.'}`);
getSES();
getTwilio();
