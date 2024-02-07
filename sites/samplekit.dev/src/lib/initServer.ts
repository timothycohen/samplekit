import { PUBLIC_ORIGIN } from '$env/static/public';
import { initDB } from '$lib/db/server/connect';
import { logger } from '$lib/logging/server';

logger.info(`[SETUP] Origin: ${PUBLIC_ORIGIN}`);
await initDB();
