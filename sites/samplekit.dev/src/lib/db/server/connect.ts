import fs from 'fs';
import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import pg from 'pg';
import { DB_NAME, PG_CONNECTION_STRING } from '$env/static/private';
import { setupLogger } from '$lib/logging/server';
import { joinRoot } from '$lib/utils/server';
import * as schema from './schema';

export const getDb = (() => {
	let _db: { pgPool: pg.Pool; db: NodePgDatabase<typeof schema> } | null = null;

	const get = () => {
		if (_db) return _db;
		const pgPool = new pg.Pool({ connectionString: PG_CONNECTION_STRING });
		const db = drizzle(pgPool, { schema });
		_db = { pgPool, db };
		return _db;
	};

	return get;
})();

export const testDb = async () => {
	try {
		const { pgPool } = getDb();
		const client = await pgPool.connect();
		client.release();
		setupLogger.info(`Connected to DB ${DB_NAME}`);
	} catch (err) {
		setupLogger.fatal(
			`Connection to db DB_NAME=\`${DB_NAME}\` failed using PG_CONNECTION_STRING with message \`${(err as Error)['message']}\`. If you are using docker, is it running? (look at package.json db: scripts)`,
		);
		process.exit(1);
	}
};

// use abs path. relative path has issues when running with build/index.js
export const migrateDb = async () => {
	const migrationsFolder = joinRoot('generated', 'db-migrations');
	if (fs.existsSync(migrationsFolder)) {
		await migrate(getDb().db, { migrationsFolder });
		setupLogger.info('Migrated DB if needed.');
	} else {
		setupLogger.warn(`No migrations found at ${migrationsFolder}. Skipping.`);
	}
};
