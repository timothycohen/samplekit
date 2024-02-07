import { error, fail as formFail, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms/server';
import { auth } from '$lib/auth/server';
import { deleteSessionSchema } from '$routes/(auth)/validators';
import type { Actions, PageServerLoad } from './$types';
import type { Action } from '@sveltejs/kit';

export const load: PageServerLoad = () => {
	error(404);
};

const logoutCurrent: Action = async ({ locals }) => {
	const seshUser = await locals.seshHandler.getSessionUser();
	if (!seshUser) return redirect(302, '/login');
	await auth.session.delete({ sessionId: seshUser.session.id });
	locals.seshHandler.set({ session: null });
	return redirect(302, '/login');
};

const logoutSingle: Action = async ({ locals, request }) => {
	const seshUser = await locals.seshHandler.getSessionUser();
	if (!seshUser) return redirect(302, '/login');

	const deleteSessionForm = await superValidate(request, deleteSessionSchema);
	if (!deleteSessionForm.valid) return formFail(400);

	const allSessions = await auth.session.getAll({ userId: seshUser.user.id });
	const userOwnsSession = allSessions.find((s) => s.id === deleteSessionForm.data.session_id);
	if (!userOwnsSession) return formFail(400);

	await auth.session.delete({ sessionId: deleteSessionForm.data.session_id });

	if (seshUser.session.id === deleteSessionForm.data.session_id) {
		locals.seshHandler.set({ session: null });
		return redirect(302, '/login');
	} else {
		return redirect(302, deleteSessionForm.data.redirect_path);
	}
};

const logoutAll: Action = async ({ locals }) => {
	const seshUser = await locals.seshHandler.getSessionUser();
	if (!seshUser) return redirect(302, '/login');
	await auth.session.deleteAll({ userId: seshUser.user.id });
	locals.seshHandler.set({ session: null });
	return redirect(302, '/login');
};

export const actions: Actions = { logoutCurrent, logoutSingle, logoutAll };
