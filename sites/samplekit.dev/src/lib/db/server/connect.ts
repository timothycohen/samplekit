import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import { browser } from '$app/environment';
import { DB_NAME, LOG_TO, PG_CONNECTION_STRING } from '$env/static/private';
import { logger } from '$lib/logging/server';
import * as schema from './schema';

let savedDb: NodePgDatabase<typeof schema> | null = null;

export const initDB = async () => {
	if (browser) throw new Error('Cannot get db on the browser');
	if (savedDb) return;

	try {
		const pgPool = new pg.Pool({ connectionString: PG_CONNECTION_STRING });
		savedDb = drizzle(pgPool, { schema });
		const client = await pgPool.connect();
		client.release();
		logger.info(`[SETUP] DB: Connected to ${DB_NAME}`);
	} catch (err) {
		const log = LOG_TO === 'DB' ? console.error.bind(console) : logger.fatal.bind(logger);
		log(
			`[SETUP] Connection to db DB_NAME=\`${DB_NAME}\` failed using PG_CONNECTION_STRING. If you are using docker, is it running? (look at package.json db: scripts)`,
		);
		process.exit(1);
	}
};

export const getDb = async () => {
	await initDB();
	return savedDb!;
};
