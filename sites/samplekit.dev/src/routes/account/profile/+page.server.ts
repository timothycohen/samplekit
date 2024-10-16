import { db } from '$lib/db/server';
import { superValidate, zod } from '$lib/superforms/server';
import { nameSchema } from '$routes/(auth)/schemas';
import type { Action } from '@sveltejs/kit';

export const load = async ({ locals }) => {
	const { user } = await locals.seshHandler.userOrRedirect();
	const nameForm = await superValidate(zod(nameSchema), { id: 'nameForm_/account/profile' });
	nameForm.data.family_name = user.familyName;
	nameForm.data.given_name = user.givenName;

	return { nameForm };
};

const updateName: Action = async ({ locals, request }) => {
	const { user } = await locals.seshHandler.userOrRedirect();
	const nameForm = await superValidate(request, zod(nameSchema));
	if (!nameForm.valid) return { nameForm };

	await db.user.update({
		userId: user.id,
		values: { familyName: nameForm.data.family_name, givenName: nameForm.data.given_name },
	});

	locals.seshHandler.invalidateCache();
};

export const actions = { updateName };
