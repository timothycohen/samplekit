import { circOut } from 'svelte/easing';
import { tweened, type Tweened } from 'svelte/motion';
import { defaultCropValue, fileToDataUrl, humanReadableFileSize } from '$lib/image/client';
import type { CroppedImg, CropValue } from '$lib/image/common';
import type { Result } from '$lib/utils/common';

//#region States
//#region Static
export type Idle = { state: 'idle' }; // entry state
export type Err = {
	state: 'error';
	img: { url: string | null; crop: CropValue | null };
	errorMsgs: [string, string] | [string, null]; // [title, body]
};
export type Completed = { state: 'completed'; savedImg: CroppedImg | null };
//#endregion Static

//#region Preexisting Image
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
//#endregion Preexisting Image

//#region New Image
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
	getUploadArgsPromise: Promise<Result<{ bucketUrl: string; formDataFields: Record<string, string> }>>;
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
//#endregion New Image

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
//#endregion States

//#region Callbacks
type GetUploadArgs = () => Promise<Result<{ bucketUrl: string; formDataFields: Record<string, string> }>>;
type Upload = (a: {
	bucketUrl: string;
	formData: FormData;
	uploadProgress: { tweened: Tweened<number>; scale: number };
}) => { promise: Promise<Result<{ status: number }>>; abort: () => void };
type SaveToDb = (a: { crop: CropValue }) => Promise<Result<{ savedImg: CroppedImg | null }>>;
type DeletePreexistingImg = () => Promise<Result<Result.Success>>;
type SaveCropToDb = (a: { crop: CropValue }) => Promise<Result<{ savedImg: CroppedImg | null }>>;
//#endregion Callbacks

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

	/** Clean up and move to 'file_selecting' */
	toFileSelect = () => {
		this.#cleanup?.();
		this.#state = { state: 'file_selecting', loadFiles: this.#loadFiles };
	};

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

	/** Get the upload url, upload the file, and save it to the DB.
	 * States: any -> 'upload_url_fetching' -> 'image_storage_uploading' -> 'db_saving' -> 'completed'
	 * */
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

		const { bucketUrl, formDataFields } = getUploadArgsPromised.data;

		const formData = new FormData();
		for (const [key, value] of Object.entries(formDataFields)) {
			formData.append(key, value);
		}
		formData.append('file', file);

		/** Upload file to image storage (progress 10-90%) */
		const { abort: abortUpload, promise: imageUploadPromise } = this.#upload({
			bucketUrl,
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
