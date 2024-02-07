import { z } from 'zod';

export const postReq = z.object({ cron_api_key: z.string().length(63) });
