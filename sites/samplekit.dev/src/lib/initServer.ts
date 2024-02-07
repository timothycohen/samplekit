import { PUBLIC_ORIGIN } from '$env/static/public';
import { initDB } from '$lib/db/server/connect';
import { logger } from '$lib/logging/server';
import { INTERCEPT_TRANSPORTS } from '$lib/transport/server/consts';

logger.info(`[SETUP] Origin: ${PUBLIC_ORIGIN}`);
await initDB();
logger.info(`[SETUP] Email and SMS: ${INTERCEPT_TRANSPORTS ? 'Blocked. Routing to console' : 'active'}`);
