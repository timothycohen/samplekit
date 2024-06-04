import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import pg from 'pg';

/**
 *
 * @param {string} name
 * @returns {string}
 */
const getEnv = (name) => {
	const env = process.env[name];
	if (!env) {
		console.error(`FATAL: ${name} environment variable is not set (are you running with env-cmd?)`);
		process.exit(1);
	}
	return env;
};

const pg_connection_string = getEnv('PG_CONNECTION_STRING');
const db_name = getEnv('DB_NAME');

if (pg_connection_string.includes('supabase')) console.info(`Database Migration Config: Supabase`);
else if (pg_connection_string.includes('localhost')) console.info(`Database Migration Config: localhost`);
else console.info(`Database Migration Config: Unknown`);

try {
	const client = new pg.Client({ connectionString: pg_connection_string });
	await client.connect();
	await migrate(drizzle(client), { migrationsFolder: './generated/db-migrations' });
	await client.end();
	console.info(`INFO: Checked migrations folder and migrated ${db_name} if necessary.`);
} catch {
	console.error(
		'FATAL: Unable to create PG client. If you are using docker, is it running? (look at package.json db: scripts)',
	);
	process.exit(1);
}
