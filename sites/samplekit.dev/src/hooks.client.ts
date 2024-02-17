import '$lib/initClient';

import { handleErrorWithSentry } from '@sentry/sveltekit';

export const handleError = handleErrorWithSentry();
