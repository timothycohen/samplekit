import { PUBLIC_ORIGIN } from '$env/static/public';
import { initDB } from '$lib/db/server/connect';
import { initSentry, setupLogger } from '$lib/logging/server';
import { INTERCEPT_TRANSPORTS } from '$lib/transport/server/consts';

await initDB();
initSentry();
setupLogger.info(`Origin is ${PUBLIC_ORIGIN}`);
setupLogger.info(`Email and SMS are ${INTERCEPT_TRANSPORTS ? 'blocked. Routing to console.' : 'active.'}`);
