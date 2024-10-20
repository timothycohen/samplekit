<script lang="ts" module>
	// import video from './assets/2024-08-05_21-17-07_465x474_24fps.mp4';
	import imgSm from './assets/image-uploader-thumbnail-1200w.webp';
	import type { RawFrontMatter } from '$lib/articles/schemas';

	export const metadata = {
		title: 'Image Cropper And Uploader',
		implementationPath: '/account/profile',
		srcCodeHref:
			'https://github.com/timothycohen/samplekit/blob/main/sites/samplekit.dev/src/lib/object-storage/client/cropImgUploadController.svelte.ts',
		description:
			'Select an image, crop it, upload it to an AWS S3 Bucket with a progress indicator, moderate it with Rekognition, save it to the DB, and serve it via AWS Cloudfront.',
		publishedAt: new Date('2024-03-20 16:37:01 -0400'),
		updates: [{ at: new Date('2024-08-16 18:59:25 -0400'), descriptions: ['Use runes.'] }],
		authors: [{ name: 'Tim Cohen', email: 'contact@timcohen.dev' }],
		imgSm,
		// video,
		tags: ['state controller', 'image uploads', 'aws', 'db', 's3', 'cloudfront', 'rekognition', 'rate limiting'],
		featured: true,
	} satisfies RawFrontMatter;
</script>

<script lang="ts">
	import { CodeTopper, HAnchor, TabPanels } from '$lib/articles/components';
	import { Admonition } from '$lib/components';
	import img_uploaderFlow from './assets/image-uploader-flow-q30.webp';

	const { data } = $props();
</script>

{#snippet Code(a: { title: string; rawHTML: string })}
	<CodeTopper title={data.code.avatarEditor.title}>
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html a.rawHTML}
	</CodeTopper>
{/snippet}

<!--#region Intro -->
<p>
	Let's allow our users to upload an image. We'll use an avatar as an example. This simple feature will touch a lot of
	topics:
</p>

<ul>
	<li>
		<p>Infrastructure</p>
		<ul>
			<li><a href="https://aws.amazon.com/s3" data-external>AWS S3</a> (image storage)</li>
			<li>
				<a href="https://aws.amazon.com/cloudfront" data-external>AWS Cloudfront</a> (distribution)
			</li>
			<li>
				<a href="https://aws.amazon.com/rekognition" data-external>AWS Rekognition</a> (content moderation)
			</li>
			<li><a href="https://aws.amazon.com/iam" data-external>AWS IAM</a> (security)</li>
			<li>
				<a href="https://www.postgresql.org/" data-external>PostgreSQL</a> with
				<a href="https://orm.drizzle.team/docs/overview" data-external>Drizzle ORM</a> (to store the user and their avatar)
			</li>
			<li><a href="https://redis.io/" data-external>Redis</a> (rate limiting)</li>
		</ul>
	</li>
	<li>
		<p>Client Features</p>
		<ul>
			<li>Upload state machine controller with Svelte <!-- shiki-ts $state() shiki-ts --></li>
			<li>Crop, file select, upload, and delete capabilities</li>
			<li>Graceful interruption and cancellation handling</li>
			<li>User friendly errors</li>
			<li>Size and file type guards</li>
			<li>File upload progress bar</li>
			<li>Images loaded from CDN</li>
		</ul>
	</li>
	<li>
		<p>Server Guards</p>
		<ul>
			<li>User authorization</li>
			<li>Rate limits</li>
			<li>Explicit content deletion</li>
			<li>Image storage access authorization</li>
			<li>Size and file type limits</li>
			<li>Zero trust client relationship</li>
		</ul>
	</li>
</ul>

<p>
	Of course, there are many alternatives to each infrastructure choice. For example,
	<a href="https://imagekit.io/" data-external>ImageKit</a> could be used as the image storage and CDN, an in-memory
	cache such as
	<a href="https://www.npmjs.com/package/@isaacs/ttlcache" data-external>ttlcache</a> could be used as the kv store,
	<a href="https://console.cloud.google.com/marketplace/product/google/vision.googleapis.com" data-external
		>Google Cloud Vision</a
	> could be used for content moderation, and so on. To keep it simple, we'll use AWS for everything except the database
	and kv store, which will be hosted directly on the server.
</p>

<Admonition kind="info" title="Bring Your Own Database">
	<div>
		This article focuses on the SvelteKit logic and integrating the AWS services. Setting up each AWS service will be
		detailed, but it's assumed you have a database and kv store.
	</div>
	<div class="mt-2">
		If not, you can use the <code class="text-info-11">pnpm dev:up</code> script in this repo's
		<code>package.json</code> to create the necessary database and kv docker containers.
	</div>
</Admonition>
<!--#endregion Intro -->

<!--#region Options -->
<HAnchor tag="h2" title="Upload Flow Options" />

<p>The basic flow is simple. Get a file input from the user, upload it to storage, and save a link in a database.</p>

<p>
	However, there are multiple possible implementation variants to our flow. There are also security features or UI
	enhancements we'll want to implement. First, let's evaluate a few different ways our basic flow could be implemented
	so we can choose one.
</p>

<HAnchor tag="h3" title="0.1 Server Heavy" />

<p>The Flow</p>

<ul>
	<li>The client uploads a file to the server.</li>
	<li>
		The server checks user authorization, rate limits the request, checks the file size, and checks the content
		moderation with <code>Rekognition</code>.
	</li>
	<li>The server uploads the file to an <code>S3</code> bucket.</li>
	<li>The server saves the file url into the database.</li>
	<li>
		In order to show the client the progress that has been made, the server pushes server-sent events with a connection
		made with <code>ReadableStream</code> and <code>EventSource</code>.
	</li>
</ul>

<p>Pros</p>

<ul>
	<li>Simple to make safe. The server has complete control.</li>
</ul>

<p>Cons</p>

<ul>
	<li>Slow. The file has to make two trips (from client to server to AWS).</li>
	<li>Memory inefficient. The server has to hold the file in memory during the entire pipeline.</li>
</ul>

<HAnchor tag="h3" title="0.2 With Webhook" />

<p>The Flow</p>

<ul>
	<li>
		The server checks user authorization, rate limits the request, generates an upload token with a predetermined size,
		and sends the presigned url to the client.
	</li>
	<li>The client uses the token to upload the file to an <code>S3</code> bucket.</li>
	<li>An AWS event notification notifies the server that a file has been created.</li>
	<li>
		The server validates the image with <code>Rekognition</code> (and deletes it if it fails validation) before saving the
		url to the database.
	</li>
</ul>

<p>Pros</p>

<ul>
	<li>Memory efficient. The file is never on the server.</li>
	<li>Simple to make safe. We rely on AWS, not the client to notify the server between steps.</li>
</ul>

<p>Cons</p>

<ul>
	<li>
		Variable speed.
		<a
			href="https://docs.aws.amazon.com/AmazonS3/latest/userguide/EventNotifications.html#:~:text=manage%20this%20subresource.-,Important,-Amazon%20S3%20event"
			data-external
		>
			Event notifications can take over a minute.
		</a>
	</li>
	<li>
		Higher complexity. Involves setting up an event notification with a lambda that POSTs the event notification data to
		our server.
	</li>
	<li>
		Harder to show the client update progress. If the updates were sent via a long lived connection (server-sent events
		or websockets) with an app scaled to multiple instances, the client request and the AWS notification might hit
		different instances. The client would have to poll the server or an adapter would be necessary to broadcast the
		event to the correct app instance.
	</li>
</ul>

<HAnchor tag="h3" title="0.3 Guarded Client Control" />

<p>The Flow</p>

<ul>
	<li>
		The server checks user authorization, rate limits the request, generates an upload token with a predetermined size,
		stores the presigned url, creates a cleanup job, and sends the presigned url to the client.
	</li>
	<li>The client uses the token to upload the file to an <code>S3</code> bucket.</li>
	<li>
		The client notifies the server that the image has been uploaded. The server confirms the image has truly been
		uploaded to the presigned url location, validates the image with <code>Rekognition</code>, removes the cleanup job,
		saves the url to the database, and returns the response to the client.
	</li>
	<li>
		If the client uploads to the url but doesn't notify us (either due to malicious intent or via a canceled/interrupted
		request), the cleanup job will delete it.
	</li>
</ul>

<p>Pros</p>

<ul>
	<li>Fast. The file goes directly from the client to AWS.</li>
	<li>Memory efficient. The file is never on the server.</li>
	<li>
		Easy to show progress. We can use three distinct http requests and the upload can use an
		<code>XMLHttpRequest</code> with <code>req.upload.addEventListener('progress', cb)</code>.
	</li>
</ul>

<p>Cons</p>

<ul>
	<li>
		Moderate complexity to make safe. We have to store knowledge of the presigned url request and also add a cleanup job
		to thwart malicious actors.
	</li>
</ul>

<HAnchor tag="h3" title="Choice" />

<p>
	This article implements the guarded client control method. It provides the best client experience (fastest, most
	visible progress), incurs minimal strain on the server, avoids extra AWS complexity, and isn't
	<span class="italic">too</span> hard to protect.
</p>

<p>
	If we try to view the server, client, and services all at once, we end up with something a hard to reason with (rate
	limiting and presigned url storage not shown):
</p>

<img src={img_uploaderFlow} alt="Upload flow" />

<p>
	By focusing on client, AWS, and server separately, the flow become very easy to reason about. We'll begin with the
	client. Separating the logic from the UI and breaking it down into finite states will make it trivial to understand.
</p>
<!--#endregion Options -->

<!--#region Controller -->
<!--#region State Snippets -->
{#snippet StaticStates()}
	<CodeTopper title="cropImgUploadController Static States">
		<!-- shiki-start
```ts
export type Idle = { state: 'idle' }; // entry state
export type Err = {
	state: 'error';
	img: { url: string | null; crop: CropValue | null };
	errorMsgs: [string, string] | [string, null]; // [title, body]
};
export type Completed = { state: 'completed'; savedImg: CroppedImg | null };
```
shiki-end -->
	</CodeTopper>
{/snippet}

{#snippet PreexistingStates()}
	<CodeTopper title="cropImgUploadController Preexisting States">
		<!-- shiki-start
```ts
export type CroppingPreexisting = {
	state: 'cropping_preexisting'; // entry state
	url: string;
	crop: CropValue;
	/**
	 * Update a preexisting image's crop value.
	 * States: 'cropping_preexisting' -> 'db_updating_preexisting' -> 'completed'
	 */
	saveCropValToDb({ crop }: { crop: CropValue }): Promise<Idle | Err | Completed>;
	/**
	 * Delete a preexisting image.
	 * States: 'cropping_preexisting' -> 'deleting_preexisting' -> 'completed'
	 */
	deleteImg: () => Promise<Idle | Err | Completed>;
};
export type DbUpdatingPreexisting = {
	state: 'db_updating_preexisting';
	url: string;
	crop: CropValue;
	updateDbPromise: Promise<Result<{ savedImg: CroppedImg | null }>>;
};
export type DeletingPreexisting = {
	state: 'deleting_preexisting';
	url: string;
	crop: CropValue;
	deletePreexistingImgPromise: Promise<Result<Result.Success>>;
};
```
shiki-end -->
	</CodeTopper>
{/snippet}

{#snippet NewImageStates()}
	<CodeTopper title="cropImgUploadController New Image States">
		<!-- shiki-start
```ts
import type { Tweened } from 'svelte/motion';

export type FileSelecting = {
	state: 'file_selecting'; // entry state
	/**
	 * Convert a file into an in memory uri, guarding max file size.
	 * States: 'file_selecting' -> 'uri_loading' -> 'uri_loaded'
	 */
	loadFiles: (a: { files: File[]; MAX_UPLOAD_SIZE: number }) => Promise<Idle | Err | UriLoaded>;
};
export type UriLoading = {
	state: 'uri_loading';
	file: File;
	uriPromise: Promise<{ uri: string; error?: never } | { uri?: never; error: Error | DOMException }>;
};
export type UriLoaded = {
	state: 'uri_loaded';
	file: File;
	uri: string;
	/** States: 'uri_loaded' -> 'cropped' */
	skipCrop: (a?: { crop: CropValue }) => Cropped;
	/** States: 'uri_loaded' -> 'cropping' */
	startCrop: () => Cropping;
};
export type Cropping = {
	state: 'cropping';
	file: File;
	uri: string;
	/** States: 'cropping' -> 'cropped' */
	loadCropValue: ({ crop }: { crop: CropValue }) => Cropped;
};
export type Cropped = {
	state: 'cropped';
	file: File;
	uri: string;
	crop: CropValue;
	/** States: 'cropped' -> 'upload_url_fetching' -> 'image_storage_uploading' -> 'db_saving' -> 'completed' */
	uploadCropped(): Promise<Idle | Err | Completed>;
};
export type UploadUrlFetching = {
	state: 'upload_url_fetching';
	file: File;
	uri: string;
	crop: CropValue;
	uploadProgress: Tweened<number>;
	getUploadArgsPromise: Promise<Result<{ url: string; formDataFields: Record<string, string> }>>;
};
export type ImageStorageUploading = {
	state: 'image_storage_uploading';
	uri: string;
	crop: CropValue;
	imageUploadPromise: Promise<Result<{ status: number }>>;
	uploadProgress: Tweened<number>;
};
export type DbSaving = {
	state: 'db_saving';
	uri: string;
	crop: CropValue;
	saveToDbPromise: Promise<Result<{ savedImg: CroppedImg | null }>>;
	uploadProgress: Tweened<number>;
};
```
shiki-end -->
	</CodeTopper>
{/snippet}

{#snippet UnionStates()}
	<CodeTopper title="cropImgUploadController Union of States">
		<!-- shiki-start
```ts
export type CropControllerState =
	| Idle
	| Err
	| Completed
	| CroppingPreexisting
	| DbUpdatingPreexisting
	| DeletingPreexisting
	| FileSelecting
	| UriLoading
	| UriLoaded
	| Cropping
	| Cropped
	| UploadUrlFetching
	| ImageStorageUploading
	| DbSaving;

export type StateName = CropControllerState['state'];
```
shiki-end -->
	</CodeTopper>
{/snippet}
<!--#endregion State Snippets -->

{#snippet Callbacks()}
	<!-- shiki-start
```ts
import type { CroppedImg, CropValue } from '$lib/image/common';
import type { Result } from '$lib/utils/common';

type GetUploadArgs = () => Promise<Result<{ url: string; formDataFields: Record<string, string> }>>;
type Upload = (a: {
	url: string;
	formData: FormData;
	uploadProgress: { tweened: Tweened<number>; scale: number };
}) => { promise: Promise<Result<{ status: number }>>; abort: () => void };
type SaveToDb = (a: { crop: CropValue }) => Promise<Result<{ savedImg: CroppedImg | null }>>;
type DeletePreexistingImg = () => Promise<Result<Result.Success>>;
type SaveCropToDb = (a: { crop: CropValue }) => Promise<Result<{ savedImg: CroppedImg | null }>>;
```
shiki-end -->
{/snippet}

<!--#region Entrypoint Snippets -->
{#snippet EntryPointIdle()}
	<CodeTopper title="cropImgUploadController Idle Entrypoint">
		<!-- shiki-start
```ts
export class CropImgUploadController {
	#state: CropControllerState = $state.raw({ state: 'idle' });
	#isIdle: boolean = $derived(this.#state.state === 'idle');
	#cleanup: null | (() => void) = null;

	#getUploadArgs: GetUploadArgs;
	#upload: Upload;
	#saveToDb: SaveToDb;
	#delImg: DeletePreexistingImg;
	#saveCropToDb: SaveCropToDb;

	get value() {
		return this.#state;
	}

	/** Clean up and move to 'idle' */
	toIdle = async (): Promise<Idle> => {
		this.#cleanup?.();
		return (this.#state = { state: 'idle' });
	};

	constructor(a: {
		getUploadArgs: GetUploadArgs;
		upload: Upload;
		saveToDb: SaveToDb;
		delImg: DeletePreexistingImg;
		saveCropToDb: SaveCropToDb;
	}) {
		this.#getUploadArgs = a.getUploadArgs;
		this.#upload = a.upload;
		this.#saveToDb = a.saveToDb;
		this.#delImg = a.delImg;
		this.#saveCropToDb = a.saveCropToDb;

		$effect(() => this.toIdle);
	}
}
```
shiki-end -->
	</CodeTopper>
{/snippet}

{#snippet PreexistingEntrypoint()}
	<CodeTopper title="cropImgUploadController Preexisting Entrypoint">
		<!-- shiki-start
```ts
export class CropImgUploadController {
...
	/** Clean up and move to 'cropping_preexisting' */
	toCropPreexisting = ({ crop, url }: { crop: CropValue; url: string }) => {
		this.#cleanup?.();
		this.#state = {
			state: 'cropping_preexisting',
			crop,
			url,
			saveCropValToDb: ({ crop }) => this.#saveCropValToDb({ crop, url }),
			deleteImg: () => this.#deleteImg({ crop, url }),
		};
	};

	#saveCropValToDb = async ({ crop, url }: { crop: CropValue; url: string }): Promise<Idle | Err | Completed> => {
		const updateDbPromise = this.#saveCropToDb({ crop });
		this.#state = { state: 'db_updating_preexisting', updateDbPromise, crop, url };
		const { data, error } = await updateDbPromise;

		if (this.#isIdle) return { state: 'idle' };
		else if (error) return (this.#state = { state: 'error', img: { url, crop }, errorMsgs: [error.message, null] });
		else return (this.#state = { state: 'completed', savedImg: data.savedImg });
	};

	#deleteImg = async ({ crop, url }: { crop: CropValue; url: string }): Promise<Idle | Err | Completed> => {
		const deletePreexistingImgPromise = this.#delImg();
		this.#state = { state: 'deleting_preexisting', deletePreexistingImgPromise, crop, url };
		const { error } = await deletePreexistingImgPromise;

		if (this.#isIdle) return { state: 'idle' };
		else if (error) return (this.#state = { state: 'error', img: { url, crop }, errorMsgs: [error.message, null] });
		else return (this.#state = { state: 'completed', savedImg: null });
	};
}
```
shiki-end -->
	</CodeTopper>
{/snippet}

{#snippet Entry1()}
	<CodeTopper title="cropImgUploadController New Entrypoint Part 1">
		<!-- shiki-start
```ts
export class CropImgUploadController {
	...
	/** Clean up and move to 'file_selecting' */
	toFileSelect = () => {
		this.#cleanup?.();
		this.#state = { state: 'file_selecting', loadFiles: this.#loadFiles };
	};
}
```
shiki-end -->
	</CodeTopper>
{/snippet}

{#snippet Entry2()}
	<!-- shiki-start
```ts
import { defaultCropValue, fileToDataUrl, humanReadableFileSize } from '$lib/image/client';

export class CropImgUploadController {
	...

	#loadFiles = async ({
		files,
		MAX_UPLOAD_SIZE,
	}: {
		files: File[];
		MAX_UPLOAD_SIZE: number;
	}): Promise<Idle | Err | UriLoaded> => {
		const file = files[0];

		if (!file) {
			return (this.#state = { state: 'error', img: { url: null, crop: null }, errorMsgs: ['No file selected', null] });
		}

		if (file.size > MAX_UPLOAD_SIZE) {
			return (this.#state = {
				state: 'error',
				img: { url: null, crop: null },
				errorMsgs: [
					`File size (${humanReadableFileSize(file.size)}) must be less than ${humanReadableFileSize(MAX_UPLOAD_SIZE)}`,
					null,
				],
			});
		}

		const uriPromise = fileToDataUrl(file);
		this.#state = { state: 'uri_loading', file, uriPromise };

		const { uri } = await uriPromise;
		if (this.#isIdle) return { state: 'idle' };
		if (!uri) {
			return (this.#state = {
				state: 'error',
				img: { url: null, crop: null },
				errorMsgs: ['Error reading file', null],
			});
		}
		return (this.#state = {
			state: 'uri_loaded',
			file,
			uri,
			skipCrop: ({ crop } = { crop: defaultCropValue }) => this.#toCropped({ crop, file, uri }),
			startCrop: () =>
				(this.#state = {
					state: 'cropping',
					file,
					uri,
					loadCropValue: ({ crop }) => this.#toCropped({ crop, file, uri }),
				}),
		});
	};

	#toCropped = ({ crop, file, uri }: { crop: CropValue; file: File; uri: string }): Cropped => {
		return (this.#state = {
			state: 'cropped',
			crop,
			file,
			uri,
			uploadCropped: async () => this.#uploadPipeline({ crop, file, uri }),
		});
	};
}
```
shiki-end -->
{/snippet}

{#snippet Entry3()}
	<CodeTopper title="cropImgUploadController New Entrypoint Part 3">
		<!-- shiki-start
```ts
import { circOut } from 'svelte/easing';
import { tweened, type Tweened } from 'svelte/motion';

export class CropImgUploadController {
	...
	#uploadPipeline = async ({
		file,
		uri,
		crop,
	}: {
		file: File;
		uri: string;
		crop: CropValue;
	}): Promise<Idle | Err | Completed> => {
		/** Get the upload url from our server (progress 3-10%) */
		const uploadProgress = tweened(0, { easing: circOut });
		const getUploadArgsPromise = this.#getUploadArgs();
		uploadProgress.set(3);
		this.#state = { state: 'upload_url_fetching', file, uri, crop, uploadProgress, getUploadArgsPromise };

		const getUploadArgsPromised = await getUploadArgsPromise;
		if (this.#isIdle) return { state: 'idle' };

		if (getUploadArgsPromised.error) {
			return (this.#state = {
				state: 'error',
				img: { url: uri, crop },
				errorMsgs: [getUploadArgsPromised.error.message, null],
			});
		}
		uploadProgress.set(10);

		const { url, formDataFields } = getUploadArgsPromised.data;

		const formData = new FormData();
		for (const [key, value] of Object.entries(formDataFields)) {
			formData.append(key, value);
		}
		formData.append('file', file);

		/** Upload file to image storage (progress 10-90%) */
		const { abort: abortUpload, promise: imageUploadPromise } = this.#upload({
			url,
			formData,
			uploadProgress: { tweened: uploadProgress, scale: 0.9 },
		});

		this.#cleanup = () => abortUpload();
		this.#state = {
			state: 'image_storage_uploading',
			crop,
			uri,
			imageUploadPromise,
			uploadProgress,
		};

		const imageUploadPromised = await imageUploadPromise;
		this.#cleanup = null;

		if (this.#isIdle) return { state: 'idle' };
		if (imageUploadPromised.error) {
			return (this.#state = {
				state: 'error',
				img: { url: uri, crop },
				errorMsgs: [imageUploadPromised.error.message, null],
			});
		}

		/** Save url to db (progress 90-100%) */
		const interval = setInterval(() => {
			uploadProgress.update((v) => {
				const newProgress = Math.min(v + 1, 100);
				if (newProgress === 100) clearInterval(interval);
				return newProgress;
			});
		}, 20);

		const saveToDbPromise = this.#saveToDb({ crop });

		this.#cleanup = () => clearInterval(interval);
		this.#state = {
			state: 'db_saving',
			crop,
			uri,
			saveToDbPromise,
			uploadProgress,
		};

		const saveToDbPromised = await saveToDbPromise;
		this.#cleanup = null;

		if (this.#isIdle) return { state: 'idle' };

		if (saveToDbPromised.error) {
			return (this.#state = {
				state: 'error',
				img: { url: uri, crop },
				errorMsgs: [saveToDbPromised.error.message, null],
			});
		}

		clearInterval(interval);
		uploadProgress.set(100);

		return (this.#state = { state: 'completed', savedImg: saveToDbPromised.data.savedImg });
	};
}
```
shiki-end -->
	</CodeTopper>
{/snippet}
<!--#endregion Entrypoint Snippets -->

<HAnchor tag="h2" title="State Controller" />

<p>
	As usual, we'll start by defining some <code>Type</code>s and <code>Interface</code>s that will simplify the
	implementation.
</p>

<HAnchor tag="h3" title="Crop Types" />

<p>
	One of our requirements is that the user should be able to crop their image. We'll do a <code>CSS</code> crop so we
	don't have to worry about modifying the image. This website uses
	<a href="https://github.com/timothycohen/samplekit/tree/staging/packages/svelte-crop-window">
		@samplekit/svelte-crop-window
	</a>
	which is a loving rune/builder based rewrite of
	<a href="https://github.com/sabine/svelte-crop-window" data-external>sabine/svelte-crop-window</a>. This package will
	handle the cropping logic for us, and we'll simply store that data alongside the url.
</p>

{@render Code(data.code.imageSchema)}

<HAnchor tag="h3" title="States" />

<p>
	We need to break the flow into separate states. That could be done in many ways, but I'm going to break them along the
	following lines.
</p>

<!-- md-start
| State Change Breakpoint            | Reasoning                                                                                                                                 |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| There's a decision branch          | Allow for easily composable pipelines                                                                                                     |
| An async function is being awaited | Allow cancellation logic to be added to the state so a cancel function can handle cancels that occurred during <code>await promise</code> |
| Something must be shown in the UI  | Allow getting user input, showing spinners, updating progress bars, etc.                                                                  |
md-end -->

<HAnchor tag="h4" title="Static" />

<p>We need some static states:</p>

{@render StaticStates()}

<HAnchor tag="h4" title="Preexisting" />

<p>
	If the user has an avatar already, we'll want to allow them to crop it, save the updated crop value, and delete it.
</p>

{@render PreexistingStates()}

<HAnchor tag="h4" title="New" />

<p>
	If the user doesn't have an image, or if they are selecting a new image, we'll need states to facilitate selecting the
	file, loading it into memory, cropping it, getting the presigned url, sending it to AWS, and saving the url to the DB.
</p>

{@render NewImageStates()}

<HAnchor tag="h4" title="Union" />
<p>Putting it all together, the controller has the following states:</p>

{@render UnionStates()}

<HAnchor tag="h3" title="Callback Types" />

<p>
	Notice that each of the three state groups has a logical entry point. We start with the <code>Idle</code> state. If
	the user already has an avatar, we can then transition to the <code>CroppingPreexisting</code> state. Otherwise, we
	can use the <code>FileSelecting</code> state.
</p>

<p>
	Some states have methods which can be used to transition to other states. Others don't because they are simply
	transitional UI states in the pipeline that don't need user interaction.
</p>

<p>In order to start implementing those states, we will need to accept some callbacks in our constructor.</p>

{@render Callbacks()}

<HAnchor tag="h3" title="Implementation" />

<p>
	Enough with the types – let's implement! We'll obviously need to store our state and callbacks. Additionally, if the
	user exits in the middle of an async function, we'll want to be able to gracefully shut down, so let's also add a
	cleanup method for that. Finally, we'll derive <code>isIdle</code> for convenience.
</p>

<HAnchor tag="h4" title="Idle Entrypoint" />

<p>Our trivial idle entrypoint is the default state of the controller.</p>

{@render EntryPointIdle()}

<HAnchor tag="h4" title="Preexisting Entrypoint" />

<p>
	Moving on to our second entrypoint – <code>CroppingPreexisting</code>:
</p>

{@render PreexistingEntrypoint()}

<HAnchor tag="h4" title="New Entrypoint" />

<p>We only have one more entry point to implement.</p>

{@render Entry1()}

<p>
	In <code>#loadFiles</code> we load the file, turn it into a data uri, and transition to <code>uri_loaded</code>. That
	state has two transition methods to either start cropping or simply use the default crop value.
</p>

<TabPanels
	files={[{ title: 'cropImgUploadController New Entrypoint Part 2', snippet: Entry2 }, data.code.loadFileImports]}
/>

<p>
	Finally we are at our last method. It's also the largest. In <code>#uploadPipeline</code> we will get the upload url, upload
	the file, and save it to the DB.
</p>

{@render Entry3()}

<p>
	And... we're done! But not really. We have some dependency injection going on here. Namely, the five callback
	functions. Let's finish up our client code with the required UI components and then we'll tackle those callbacks.
</p>
<!--#endregion Controller -->

<!--#region UI -->
<HAnchor tag="h2" title="UI" />

<HAnchor tag="h3" title="Base Components" />

<p>
	We'll need a few components to show our UI state. We'll make them mostly dumb components so the logic can be isolated
	inside the file where the <code>CropImgUploadController</code> is instantiated.
</p>

<TabPanels files={data.code.ui} />

<HAnchor tag="h3" title="Avatar Editor" />

<p>
	The final UI component will be the controller component <code>AvatarEditor.svelte</code> that orchestrates the UI
	components created above using the <code>CropImgUploadController</code>. It receives an avatar from the parent and
	passes the changes back up with <code>onCancel</code> and <code>onNewAvatar</code> callbacks. This component lives on
	a page behind an auth guard. SampleKit uses
	<a href="https://github.com/timothycohen/samplekit/tree/staging/packages/auth" data-external>its own auth package</a>.
	There are many other options. For example,
	<a href="https://lucia-auth.com/" data-external>Lucia Auth</a>.
</p>

{@render Code(data.code.avatarEditor)}

<p>
	We've finished the controller and UI, but we still have to implement the five callback functions that the
	<code>CropImgUploadController</code> requires:
</p>

<!-- shiki-start
```ts
import { objectStorage, CropImgUploadController } from '$lib/object-storage/client';
import { updateAvatarCrop } from './avatar/crop.json/client';
import { getSignedAvatarUploadUrl, checkAndSaveUploadedAvatar, deleteAvatar } from './avatar/upload.json/client';
import { MAX_UPLOAD_SIZE } from './avatar/upload.json/common';
```
shiki-end -->
<!--#endregion UI -->

<!--#region Callbacks -->
<HAnchor tag="h2" title="Dependency Injection Callbacks" />

<p>
	Of the five callbacks, <code>GetUploadArgs</code>, <code>SaveToDb</code>, <code>DeletePreexistingImg</code>, and
	<code>SaveCropToDb</code> are requests to our own server endpoints. They're implemented with the
	<a href="/articles/typesafe-fetch-handler"> TypeSafe Fetch Handler we created in a previous article</a>.
	<code>Upload</code>, however, is a request directly to AWS using the credentials the server sent the client along with
	an <code>uploadProgress</code> object that will show the status of the user. Let's tackle that first.
</p>

<HAnchor tag="h3" title="Uploader" />

<p>
	The upload function is called by the client to upload directly to the presigned url. In order to keep the
	<code>uploadProgress</code> in sync with the upload state, we'll use an <code>XMLHttpRequest</code> which supports a
	<code>progress</code> listener instead of <code>fetch</code>. Because <code>XMLHttpRequest</code> uses listeners and
	callbacks, we'll promisify it and split the <code>promise</code> and <code>abort</code>.
</p>

{@render Code(data.code.objectStorage)}

<HAnchor tag="h3" title="Client Endpoints" />

<p>
	We're down to just the four callbacks within the two endpoints. These two client files define the
	<a href="/articles/typesafe-fetch-handler">typesafe fetch handlers</a>
	that will correspond to the
	<code>+server.ts</code> endpoints.
</p>

<TabPanels files={data.code.api.client} />

<p>
	That's the last of the client code, but these two fetch handlers route to unimplemented server endpoints. They will
	call the AWS SDKs, so we'll set up AWS and then come back to finish the marathon at the endpoints.
</p>
<!--#endregion Callbacks -->

<!--#region AWS -->
<!--#region IAM -->
{#snippet IAM1()}
	<CodeTopper title="Select User name you created -> Add permissions -> Create Inline Policy -> JSON">
		<!-- shiki-start
```json
{
	"Version": "2012-10-17",
	"Statement": [
		{
			"Sid": "s3",
			"Effect": "Allow",
			"Action": [
				"s3:PutObject",
				"s3:DeleteObject"
			],
			"Resource": [
				"arn:aws:s3:::samplekit",
				"arn:aws:s3:::samplekit/*"
			]
		}
	]
}
```
shiki-end -->
	</CodeTopper>
{/snippet}

{#snippet IAM2()}
	<CodeTopper title="IAM -> Users -> User name you created -> Policy you created">
		<!-- shiki-start
```json
{
"Version": "2012-10-17",
"Statement": [
	{
		"Sid": "s3",
		"Effect": "Allow",
		"Action": [
			"s3:PutObject",
			"s3:DeleteObject"
		],
		"Resource": [
			"arn:aws:s3:::samplekit",
			"arn:aws:s3:::samplekit/*"
		]
	},
	{ //! d"diff-add"
		"Sid": "cloudfront", //! d"diff-add"
		"Effect": "Allow", //! d"diff-add"
		"Action": [ //! d"diff-add"
			"cloudfront:CreateInvalidation" //! d"diff-add"
		], //! d"diff-add"
		"Resource": [ //! d"diff-add"
			"arn:aws:cloudfront::069636842578:distribution/*" //! d"diff-add"
		] //! d"diff-add"
	} //! d"diff-add"
]
}
```
shiki-end -->
	</CodeTopper>
{/snippet}

{#snippet IAM3()}
	<CodeTopper title="IAM -> Users -> User name you created -> Policy you created">
		<!-- shiki-start
```json
{
"Version": "2012-10-17",
"Statement": [
	{
		"Sid": "s3",
		"Effect": "Allow",
		"Action": [
			"s3:PutObject",
			"s3:DeleteObject",
			"s3:GetObject" //! d"diff-add"
		],
		"Resource": [
			"arn:aws:s3:::samplekit",
			"arn:aws:s3:::samplekit/*"
		]
	},
	{
		"Sid": "cloudfront",
		"Effect": "Allow",
		"Action": [
			"cloudfront:CreateInvalidation"
		],
		"Resource": [
			"arn:aws:cloudfront::069636842578:distribution/*"
		]
	},
	{ //! d"diff-add"
		"Sid": "rekognition", //! d"diff-add"
		"Effect": "Allow", //! d"diff-add"
		"Action": [ //! d"diff-add"
			"rekognition:DetectModerationLabels" //! d"diff-add"
		], //! d"diff-add"
		"Resource": [ //! d"diff-add"
			"*" //! d"diff-add"
		] //! d"diff-add"
	} //! d"diff-add"
]
}
```
shiki-end -->
	</CodeTopper>
{/snippet}
<!--#endregion IAM -->

<!-- #region Misc -->
{#snippet PackageJSON()}
	<CodeTopper title="package.json">
		<!-- shiki-start
```json
"dependencies": {
	"@aws-sdk/client-cloudfront": "^3.474.0",
	"@aws-sdk/client-rekognition": "^3.474.0",
	"@aws-sdk/client-s3": "^3.474.0",
	"@aws-sdk/s3-presigned-post": "^3.478.0",
}
```
shiki-end -->
	</CodeTopper>
{/snippet}

{#snippet SDK()}
	<CodeTopper title="AWS SDKs">
		<!-- shiki-start
```ts
import { CloudFrontClient, CreateInvalidationCommand } from '@aws-sdk/client-cloudfront';
import { RekognitionClient, DetectModerationLabelsCommand } from '@aws-sdk/client-rekognition';
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
```
shiki-end -->
	</CodeTopper>
{/snippet}

{#snippet Cors()}
	<CodeTopper title="Select bucket -> Permissions -> (CORS) -> Edit">
		<!-- shiki-start
```json
[
	{
		"AllowedHeaders": ["*"],
		"AllowedMethods": ["POST"],
		"AllowedOrigins": ["*"],
		"ExposeHeaders": []
	}
	]
```
shiki-end -->
	</CodeTopper>
{/snippet}

{#snippet Env()}
	<CodeTopper title=".env">
		<!-- shiki-start
```sh
AWS_SERVICE_REGION="" # for example: us-east-1

# https://console.aws.amazon.com/iam/home -> Select User -> Security credentials -> Create access key -> Copy access key and secret
IAM_ACCESS_KEY_ID=""
IAM_SECRET_ACCESS_KEY=""

S3_BUCKET_NAME="" # The name of the bucket you created
S3_BUCKET_URL="" # https://[bucket-name].s3.[region].amazonaws.com

# https://console.aws.amazon.com/cloudfront -> Select distribution
CLOUDFRONT_URL=""             # Copy Distribution domain name (including https://)
CLOUDFRONT_DISTRIBUTION_ID="" # Copy ARN – the last digits after the final "/"
```
shiki-end -->
	</CodeTopper>
{/snippet}
<!-- #endregion Misc -->

<HAnchor tag="h2" title="AWS" />
<p>
	If you don't already have one, you will need to <a href="https://aws.amazon.com/" data-external>
		set up account at aws.amazon.com
	</a>. We will create four services. S3 will hold the images, Rekognition will moderate explicit content, CloudFront
	will serve the images, and IAM will manage access.
</p>

<Admonition kind="warning" title="Pay Per Use">
	<p class="my-2">These services are pay per use and cost cents to test.</p>
	<p class="my-2">
		However, if they are not properly protected, a malicious user could use them to rack up a large bill.
	</p>
	<p class="my-0">Be sure to protect your keys, limit access methods, rate limit, and set up billing alerts.</p>
</Admonition>

<HAnchor tag="h3" title="Install AWS SDKs" />

<p>All of the AWS code will use the official client SDKs.</p>

{@render PackageJSON()}

<p>
	Using the SDKs, a client is created and then commands are sent with the client. Here are the commands we'll be using.
</p>

{@render SDK()}

<p>We need to enable the services on AWS, and then configure their permissions with an AWS IAM policy.</p>

<HAnchor tag="h3" title="Enable Services" />

<HAnchor tag="h4" title="Creating the S3 Bucket" />

<p>
	Choose "create bucket" on the <a href="https://s3.console.aws.amazon.com/s3/" data-external>S3 dashboard</a> and create
	a new bucket with a unique name (for example the name of your app) and all the default settings.
</p>

<p>
	Edit the <code>CORS</code> configuration so the client can <code>POST</code> directly to the AWS bucket. "Block all public
	access" will prevent users from uploading directly without a presigned key.
</p>

{@render Cors()}

<HAnchor tag="h4" title="Creating the IAM Policy" />

<p>
	At <a href="https://us-east-1.console.aws.amazon.com/iamv2/home#/users" data-external>IAM</a>, create a new user –
	naming it the same as your app will make it easy to remember. Use all default settings.
</p>

<p>Create a policy that will allow creating and deleting images in the bucket.</p>

{@render IAM1()}

<p>
	Click "Next", give it a policy name (again I've used the name of my app), and hit "Create Policy". Done! Now we have
	permission to create and delete objects in the bucket.
</p>

<HAnchor tag="h4" title="Creating the Cloudfront Distribution" />

<p>
	Choose "Create Distribution" at <a href="https://us-east-1.console.aws.amazon.com/cloudfront" data-external>
		AWS Cloudfront
	</a>.
</p>

<ul>
	<li>Origin Domain: Choose S3 bucket</li>
	<li>Origin Access -> Origin access control settings -> Choose Bucket Name</li>
	<li>Redirect HTTP to HTTPS: Yes</li>
	<li>Do not enable security protections (WAF is not pay per use)</li>
</ul>

<p>
	After finishing with "Create distribution", you will be given a bucket policy. Copy this into your S3 bucket: Select
	Bucket -> Permissions -> Bucket Policy.
</p>

<HAnchor tag="h4" title="Add Cloudfront to the IAM Policy" />

<p>
	When an S3 object is deleted, the Cloudfront cache is not automatically invalidated. We'll do that manually, and
	therefore <code>cloudfront:CreateInvalidation</code> permissions will need to be granted.
</p>

{@render IAM2()}

<HAnchor tag="h4" title="Add Rekognition to the IAM Policy" />

<p>
	We will grant

	<code>rekognition:DetectModerationLabels</code> permissions, but also <code>s3:GetObject</code> so Rekognition is able
	to detect directly from the S3 bucket.
</p>

{@render IAM3()}

<p>Let's create an IAM access token and add our environmental variables.</p>

{@render Env()}

<HAnchor tag="h3" title="AWS Server Code" />

<HAnchor tag="h4" title="AWS SDKs" />

<p>
	AWS has been configured on our account and we are ready to use them with the SDKs. The clients are wrapped in getters
	so they are not created during the app build.
</p>

<TabPanels files={data.code.aws} />

<HAnchor tag="h4" title="Helpers" />

<p>
	We need some way to organize the S3 files. We could add meta tags, but it becomes cumbersome because S3 doesn't have a
	way to perform CRUD actions based on the tags without intermediary requests. Instead we'll silo the files into
	"folders" by manipulating the key. That way, we can download the entire dev branch, delete all of a user's images,
	etc. Creating keys by hand on each call would be messy, so let's make a key controller.
</p>

{@render Code(data.code.keyController)}

<p>
	Lastly, we saw in our flow that we will need to create some kind of job that will remove any images that weren't
	uploaded within a certain time. Let's implement that.
</p>

{@render Code(data.code.unsavedUploadsCleaner)}
<!--#endregion AWS -->

<!--#region Server -->
<HAnchor tag="h2" title="Server Endpoints" />

<p>
	The last piece of the puzzle is to implement the two server endpoints: <code>crop.json</code> and
	<code>upload.json</code>.
</p>

<HAnchor tag="h3" title="Crop" />

<p>
	<code>crop.json/+server.ts</code> is easy because we're just updating the crop value. Let's get that out of the way.
</p>

{@render Code(data.code.api.cropServer)}

<HAnchor tag="h3" title="Upload" />

<p>For the uploader, we require a rate limiter and some way to save the presigned urls.</p>

<HAnchor tag="h4" title="Rate Limiter" />

<p>
	SampleKit uses its
	<a
		href="https://github.com/timothycohen/samplekit/blob/staging/sites/samplekit.dev/src/lib/rate-limit/server.ts"
		data-external
	>
		own rate limiter
	</a>
	around a Redis client so that multiple instances of the app can be deployed. If that's not a consideration, a good in-memory
	rate limiter is
	<a href="https://github.com/ciscoheat/sveltekit-rate-limiter/blob/main/src/lib/server/index.ts" data-external>
		sveltekit-rate-limiter
	</a>, a package created by the author of sveltekit-superforms.
</p>

<HAnchor tag="h4" title="Signed URL Storage" />

<p>The presigned urls are stored in the database.</p>

<TabPanels files={data.code.presigned} />

<HAnchor tag="h4" title="Endpoint" />

<p>We can now implement the last endpoint, and with it, complete the entire feature.</p>

{@render Code(data.code.api.uploadServer)}
<!--#endregion Server -->

<!--#region Conclusion -->
<HAnchor tag="h2" title="Conclusion" />

<p>
	This one covered a lot of ground. I hope it helps you integrate AWS services into your SvelteKit app, provides some
	ideas for how to handle a state controller, and opens up the possibility of safely allowing users to upload images
	directly to your S3 bucket. There are of course more features that could be added, such as using image transformations
	so the client isn't loading a full size image for a tiny avatar. For that, there is an
	<a href="https://aws.amazon.com/solutions/implementations/serverless-image-handler/" data-external>
		AWS solution (Serverless Image Handler)
	</a>
	and a third party way <a href="https://imagekit.io/" data-external>(imagekit.io)</a>. No matter which service you
	choose, the client and server code we've created could just as easily be applied there.
</p>

<p>
	As always, please do share your thoughts over in the
	<a href="https://github.com/timothycohen/samplekit/discussions" data-external>GitHub discussions</a>. Until next time,
	happy coding!
</p>
<!--#endregion Conclusion -->
