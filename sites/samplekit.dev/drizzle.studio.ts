import type { Config } from 'drizzle-kit';

const PG_CONNECTION_STRING = process.env['PG_CONNECTION_STRING'];

if (!PG_CONNECTION_STRING) {
	throw new Error('PG_CONNECTION_STRING environment variable is not set (are you running with env-cmd?)');
}

export default {
	schema: ['./src/lib/db/server/schema'],
	dialect: 'postgresql',
	dbCredentials: { url: PG_CONNECTION_STRING },
} satisfies Config;
