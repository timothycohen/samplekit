import { getDb } from './connect';

const db = await getDb();
export { db };

export * from './schema';
export * from './controllers';
