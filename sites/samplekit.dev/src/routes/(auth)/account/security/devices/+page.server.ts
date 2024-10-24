import { auth } from '$lib/auth/server';
import { pluralize } from '$lib/utils/common';

const lastSeen = ({ lastSeen, updateEvery }: { lastSeen: Date; updateEvery: number }) => {
	const diff = Date.now() - lastSeen.getTime();
	const days = Math.floor(diff / (1000 * 60 * 60 * 24));
	const hours = Math.floor(diff / (1000 * 60 * 60)) - days * 24;
	const minutes = Math.floor(diff / (1000 * 60)) - days * 24 * 60 - hours * 60;

	const updateEveryTime = updateEvery / (1000 * 60);

	if (days > 0) return `${days} ${pluralize('day', days)} ago`;
	if (hours > 0) return `${hours} ${pluralize('hour', hours)} ago`;
	if (minutes < 1) return `just now`;
	if (minutes < updateEveryTime) return `within the past ${updateEveryTime} ${pluralize('minute', updateEveryTime)}`;
	return `${minutes} ${pluralize('minute', minutes)} ago`;
};

export const load = async ({ locals }) => {
	const { user, session } = await locals.seshHandler.userOrRedirect();

	const allSessions = (await auth.session.getAll({ userId: user.id }))
		.sort((a, b) => {
			if (a.id === session.id) return -1;
			if (b.id === session.id) return 1;
			return b.lastSeen.getTime() - a.lastSeen.getTime();
		})
		.filter((s) => s.persistent || session.id === s.id)
		.map((s) => ({
			// TODO location
			id: s.id,
			os: s.os,
			browser: s.browser,
			ip: s.ip,
			lastSeen:
				s.id === session.id
					? `just now`
					: lastSeen({ lastSeen: s.lastSeen, updateEvery: auth.config.lastSeen.updateEvery }),
			current: session.id === s.id,
			created: new Date(s.login),
			icon: s.os === 'Windows' ? 'windows' : s.os === 'Mac OS' ? 'apple' : s.os === 'Linux' ? 'linux' : 'desktop',
			persistent: s.persistent,
		}));

	return {
		allSessions,
		expirationDuration: `${
			Math.floor(auth.config.sessionExpiresIn.activePeriod + auth.config.sessionExpiresIn.idlePeriod) /
			(1000 * 60 * 60 * 24)
		} days`,
	};
};
