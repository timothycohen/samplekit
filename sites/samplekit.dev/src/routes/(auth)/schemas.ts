import { z } from 'zod';

const email = { email: z.string().email().trim().toLowerCase() };

const redirect = { redirect_path: z.string().optional() };

const phone = { phone_number: z.string().min(1, 'Missing phone number') };

const confirmPassword = { password: z.string().trim() };

const createPassword = {
	password: z
		.string()
		.trim()
		.min(8, { message: 'at least 8 characters' })
		.max(255, { message: 'at most 255 characters' })
		.refine((val) => /[A-Z]/.test(val), { message: 'at least 1 uppercase letter' })
		.refine((val) => /[a-z]/.test(val), { message: 'at least 1 lowercase letter' })
		.refine((val) => /[0-9]/.test(val), { message: 'at least 1 number' }),
};

const name = {
	given_name: z
		.string()
		.trim()
		.min(1, { message: 'First name is required' })
		.max(255, { message: 'First name is too long' }),
	family_name: z
		.string()
		.trim()
		.min(1, { message: 'Last name is required' })
		.max(255, { message: 'Last name is too long' }),
};

const code = {
	'auth-0': z.number().min(0).max(9),
	'auth-1': z.number().min(0).max(9),
	'auth-2': z.number().min(0).max(9),
	'auth-3': z.number().min(0).max(9),
	'auth-4': z.number().min(0).max(9),
	'auth-5': z.number().min(0).max(9),
};

const persistent = { persistent: z.boolean() };

const turnstileRequired = { 'turnstile-used': z.boolean() };

export const phoneNumberSchema = z.object({ ...phone });

export const confirmPassSchema = z.object({ ...confirmPassword, ...redirect });

export const nameSchema = z.object({ ...name });

export const signupSchema = z.object({ ...email, ...name, ...createPassword, ...turnstileRequired, ...persistent });

export const signinSchema = z.object({ ...email, ...confirmPassword, ...turnstileRequired, ...persistent });

export const emailPassResetSchema = z.object({ ...email, ...turnstileRequired });

export const createNewPassSchema = z
	.object({ password: createPassword.password, confirmation: confirmPassword.password, persistent: z.boolean() })
	.superRefine(({ password, confirmation }, ctx) => {
		if (password !== confirmation) {
			ctx.addIssue({
				path: ['confirmation'],
				code: 'custom',
				message: 'Passwords do not match',
			});
		}
	});

export const updatePassSchema = z
	.object({
		currentPassword: confirmPassword.password,
		password: createPassword.password,
		confirmation: confirmPassword.password,
	})
	.superRefine(({ password, confirmation }, ctx) => {
		if (password !== confirmation) {
			ctx.addIssue({
				path: ['confirmation'],
				code: 'custom',
				message: 'Passwords do not match',
			});
		}
	});

export const sendSMSTokenSchema = z.object({ ...redirect });

export const verifyOTPSchema = z.object({ ...code, ...redirect });

export const deleteSessionSchema = z.object({ session_id: z.string(), redirect_path: z.string() });
