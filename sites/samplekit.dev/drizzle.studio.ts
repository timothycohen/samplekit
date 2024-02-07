import type { Config } from 'drizzle-kit';

const PG_CONNECTION_STRING = process.env['PG_CONNECTION_STRING'];

if (!PG_CONNECTION_STRING) {
	throw new Error('PG_CONNECTION_STRING environment variable is not set (are you running with env-cmd?)');
}
if (PG_CONNECTION_STRING.includes('supabase')) console.info(`Database Migration Config: Supabase`);
else if (PG_CONNECTION_STRING.includes('localhost')) console.info(`Database Migration Config: localhost`);
else console.info(`Database Migration Config: Unknown`);

export default {
	schema: ['./src/lib/db/server/schema'],
	driver: 'pg',
	dbCredentials: { connectionString: PG_CONNECTION_STRING },
} satisfies Config;
