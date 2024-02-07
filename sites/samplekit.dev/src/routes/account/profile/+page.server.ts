import { eq } from 'drizzle-orm';
import { superValidate } from 'sveltekit-superforms/server';
import { db, users } from '$lib/db/server';
import { nameSchema } from '$routes/(auth)/validators';
import type { Actions, PageServerLoad } from './$types';
import type { Action } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
	const { user } = await locals.seshHandler.userOrRedirect();
	const nameForm = await superValidate(nameSchema, { id: 'nameForm_/account/profile' });
	nameForm.data.family_name = user.familyName;
	nameForm.data.given_name = user.givenName;

	return { nameForm };
};

const updateName: Action = async ({ locals, request }) => {
	const { user } = await locals.seshHandler.userOrRedirect();
	const nameForm = await superValidate(request, nameSchema);
	if (!nameForm.valid) return { nameForm };

	await db
		.update(users)
		.set({ familyName: nameForm.data.family_name, givenName: nameForm.data.given_name })
		.where(eq(users.id, user.id));

	locals.seshHandler.invalidateCache();
};

export const actions: Actions = { updateName };
