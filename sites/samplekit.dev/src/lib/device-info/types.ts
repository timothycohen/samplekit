export type GetDeviceInfo = (a: { headers: Headers; getClientAddress: () => string }) => {
	os: string | null;
	browser: string | null;
	ip: string;
};
