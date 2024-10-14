import { passkey } from './passkey/handlers.js';
import type { ClientAuth } from '../types/client.js';

export const auth: ClientAuth = {
	passkey,
};
