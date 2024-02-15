import { jsonb, pgTable } from 'drizzle-orm/pg-core';
import { dbLogs } from '$lib/logging/server';

export const debugLogs = pgTable(dbLogs.debug.table, { log: jsonb(dbLogs.debug.column) });
export const errorLogs = pgTable(dbLogs.error.table, { log: jsonb(dbLogs.error.column) });
export const guardApiLogs = pgTable(dbLogs.guardApi.table, { log: jsonb(dbLogs.guardApi.column) });
