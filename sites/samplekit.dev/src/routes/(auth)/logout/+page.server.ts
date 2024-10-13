import { error, fail as formFail, redirect, type Action } from '@sveltejs/kit';
import { auth } from '$lib/auth/server';
import { checkedRedirect } from '$lib/http/server';
import { superValidate, zod } from '$lib/superforms/server';
import { deleteSessionSchema } from '$routes/(auth)/validators';

export const load = () => {
	error(404);
};

const logoutCurrent: Action = async ({ locals }) => {
	const seshUser = await locals.seshHandler.getSessionUser();
	if (!seshUser) return checkedRedirect('/login');
	await auth.session.delete({ sessionId: seshUser.session.id });
	locals.seshHandler.set({ session: null });
	return checkedRedirect('/login');
};

const logoutSingle: Action = async ({ locals, request }) => {
	const seshUser = await locals.seshHandler.getSessionUser();
	if (!seshUser) return checkedRedirect('/login');

	const deleteSessionForm = await superValidate(request, zod(deleteSessionSchema));
	if (!deleteSessionForm.valid) return formFail(400);

	const allSessions = await auth.session.getAll({ userId: seshUser.user.id });
	const userOwnsSession = allSessions.find((s) => s.id === deleteSessionForm.data.session_id);
	if (!userOwnsSession) return formFail(400);

	await auth.session.delete({ sessionId: deleteSessionForm.data.session_id });

	if (seshUser.session.id === deleteSessionForm.data.session_id) {
		locals.seshHandler.set({ session: null });
		return checkedRedirect('/login');
	} else {
		return redirect(302, deleteSessionForm.data.redirect_path);
	}
};

const logoutAll: Action = async ({ locals }) => {
	const seshUser = await locals.seshHandler.getSessionUser();
	if (!seshUser) return checkedRedirect('/login');
	await auth.session.deleteAll({ userId: seshUser.user.id });
	locals.seshHandler.set({ session: null });
	return checkedRedirect('/login');
};

export const actions = { logoutCurrent, logoutSingle, logoutAll };
