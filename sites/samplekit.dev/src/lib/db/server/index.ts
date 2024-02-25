import { getDb } from './connect';

export const { db } = getDb();

export * from './schema';
export * from './controllers';
