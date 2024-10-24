import '$lib/initClient';

import { handleErrorWithSentry } from '$lib/logging/client';

export const handleError = handleErrorWithSentry();
