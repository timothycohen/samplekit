export const fileToDataUrl = (
	blob: Blob,
): Promise<{ uri: string; error?: never } | { uri?: never; error: Error | DOMException }> => {
	return new Promise((resolve) => {
		const reader = new FileReader();
		reader.onload = (_e) => resolve({ uri: reader.result as string });
		reader.onerror = (_e) => resolve({ error: reader.error ?? new Error('Unknown error') });
		reader.onabort = (_e) => resolve({ error: new Error('Read aborted') });
		reader.readAsDataURL(blob);
	});
};

export const humanReadableFileSize = (size: number) => {
	if (size < 1024) return `${size}B`;
	if (size < 1024 * 1024) return `${(size / 1024).toPrecision(2)}kB`;
	return `${(size / (1024 * 1024)).toPrecision(2)}MB`;
};
