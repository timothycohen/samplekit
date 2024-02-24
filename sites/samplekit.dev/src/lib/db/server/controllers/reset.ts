import { sql } from 'drizzle-orm';
import { db } from '..';

const resetSql = /*sql*/ `
DO $$
DECLARE
    v_table_name TEXT;
BEGIN
    FOR v_table_name IN
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
    LOOP
        EXECUTE format('TRUNCATE TABLE %I RESTART IDENTITY CASCADE;', v_table_name);
        RAISE NOTICE 'Table % truncated successfully.', v_table_name;
    END LOOP;
END $$;
`;

export const resetDb = () => db.execute(sql.raw(resetSql));
