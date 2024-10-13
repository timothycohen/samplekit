export const load = async ({ locals }) => {
	const { user } = await locals.seshHandler.userOrRedirect();
	return { user };
};
