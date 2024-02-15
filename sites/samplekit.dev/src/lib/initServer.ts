import { LOG_TO } from '$env/static/private';
import { PUBLIC_ORIGIN } from '$env/static/public';
import { initDB } from '$lib/db/server/connect';
import { logger, initSentry } from '$lib/logging/server';
import { INTERCEPT_TRANSPORTS } from '$lib/transport/server/consts';

await initDB(); // Initialize DB first in case logs are written to it
initSentry();
logger.info(`[SETUP] Logs routed to ${LOG_TO}`);
logger.info(`[SETUP] Origin: ${PUBLIC_ORIGIN}`);
logger.info(`[SETUP] Email and SMS: ${INTERCEPT_TRANSPORTS ? 'Blocked. Routing to console' : 'active'}`);
