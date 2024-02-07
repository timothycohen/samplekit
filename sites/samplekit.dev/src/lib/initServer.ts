import { PUBLIC_ORIGIN } from '$env/static/public';
import { logger } from '$lib/logging/server';

logger.info(`[SETUP] Origin: ${PUBLIC_ORIGIN}`);
