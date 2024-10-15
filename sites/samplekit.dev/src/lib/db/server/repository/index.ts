import { meta } from './meta';
import { presigned } from './presigned';
import { user } from './user';
import type { DBRepository } from './types';

export const db: DBRepository = {
	presigned,
	meta,
	user,
};

// presigned_url
// auth_provider
// session: SessionT
// user_account: UserT
// token_passkey_challenge
// token_setup_authenticator
// token_email_veri
// token_pw_reset
// token_sms_veri
// token_setup_sms_veri
