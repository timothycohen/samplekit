import type { Config } from 'drizzle-kit';

export default {
	schema: ['./src/lib/db/server/schema'],
	out: 'generated/db-migrations/',
	dialect: 'postgresql',
} satisfies Config;
