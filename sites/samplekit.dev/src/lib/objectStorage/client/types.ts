import type { Result } from '$lib/utils/common';
import type { Tweened } from 'svelte/motion';

export type UploaderArgs = {
	url: string;
	formData: FormData;
	uploadProgress?: { scale?: number | undefined; tweened?: Tweened<number> | undefined } | undefined;
};
export type UploaderRes = { promise: Promise<Result<{ status: number }>>; abort: () => void };

export type Uploader = (a: UploaderArgs) => UploaderRes;

export type ObjectStorageClient = {
	upload: Uploader;
};
