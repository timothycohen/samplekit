import type { Result } from '$lib/utils/common';
import type { Tweened } from 'svelte/motion';

/**
 * @aws-sdk/s3-request-presigner: uploadUrl: `${bucketUrl}/${objectKey}`, method: PUT, data: File
 *
 * @aws-sdk/s3-presigned-post: uploadUrl: bucketUrl, method: POST, data: FormData
 */
export type Uploader = (a: {
	uploadUrl: string;
	data: File | FormData;
	uploadProgress?: { scale?: number | undefined; tweened?: Tweened<number> | undefined } | undefined;
	method: 'PUT' | 'POST';
}) => {
	promise: Promise<Result<{ status: number }>>;
	abort: () => void;
};

export const uploadToCloudStorage: Uploader = ({ method, uploadUrl, data, uploadProgress }) => {
	const req = new XMLHttpRequest();
	req.open(method, uploadUrl);

	if (uploadProgress?.tweened) {
		req.upload.addEventListener('progress', (e) =>
			uploadProgress.tweened?.update((p) => Math.max(p, (e.loaded / e.total) * 100 * (uploadProgress?.scale ?? 1))),
		);
	}

	const promise = new Promise<Result<{ status: number }>>((resolve) => {
		req.onreadystatechange = () => {
			if (req.readyState === 4) {
				if (req.status >= 200 && req.status < 300) {
					resolve({ data: { status: req.status } });
				} else if (req.status === 0) {
					resolve({ error: { status: 499, message: 'Upload aborted' } });
				} else {
					console.error('Error uploading file. Status:', req.status, 'Response:', req.responseText);
					resolve({ error: { status: req.status, message: 'Error uploading file' } });
				}
			}
		};
	});

	req.send(data);
	return { abort: req.abort.bind(req), promise };
};
