import platform from 'platform';
import type { GetDeviceInfo } from './types';

export const getDeviceInfo: GetDeviceInfo = ({ headers, getClientAddress }) => {
	const pf = platform.parse(headers.get('user-agent') ?? undefined);
	return { os: pf.os?.family ?? null, browser: pf.name ?? null, ip: getClientAddress() };
};
