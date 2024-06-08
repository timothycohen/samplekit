import { circOut } from 'svelte/easing';
import { tweened, type Tweened } from 'svelte/motion';
import { get, type Writable } from 'svelte/store';
import { defaultCropValue, fileToDataUrl, humanReadableFileSize } from '$lib/image/client';
import type { CroppedImg, CropValue } from '$lib/image/client';
import type { Result } from '$lib/utils/common';

//#region States
// static
export type Err = {
	state: 'error';
	img: { url: string | null; crop: CropValue | null };
	errorMsgs: [string, string] | [string, null]; // [title, body]
};
export type Canceled = { state: 'canceled' };
export type Completed = { state: 'completed'; savedImg: CroppedImg | null };

// preexisting image
export type CroppingPreexisting = { state: 'cropping_preexisting'; url: string; crop: CropValue };
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

// new image
export type FileSelecting = { state: 'file_selecting' };
export type UriLoading = {
	state: 'uri_loading';
	file: File;
	uriPromise: Promise<{ uri: string; error?: never } | { uri?: never; error: Error | DOMException }>;
};
export type UriLoaded = { state: 'uri_loaded'; file: File; uri: string };
export type Cropping = { state: 'cropping'; file: File; uri: string };
export type Cropped = { state: 'cropped'; file: File; uri: string; crop: CropValue };
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
	abortUpload: () => void;
	imageUploadPromise: Promise<Result<{ status: number }>>;
	uploadProgress: Tweened<number>;
};
export type DbSaving = {
	state: 'db_saving';
	uri: string;
	crop: CropValue;
	interval: ReturnType<typeof setInterval>;
	saveToDbPromise: Promise<Result<{ savedImg: CroppedImg | null }>>;
	uploadProgress: Tweened<number>;
};

export type CropControllerState =
	| Err
	| Canceled
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

//#region Types
type GetUploadArgs = () => Promise<Result<{ bucketUrl: string; formDataFields: Record<string, string> }>>;
type Upload = (a: {
	bucketUrl: string;
	formData: FormData;
	uploadProgress: { tweened: Tweened<number>; scale: number };
}) => { promise: Promise<Result<{ status: number }>>; abort: () => void };
type SaveToDb = (a: { crop: CropValue }) => Promise<Result<{ savedImg: CroppedImg | null }>>;
type DeletePreexistingImg = () => Promise<Result<Result.Success>>;
type SaveCropToDb = (a: { crop: CropValue }) => Promise<Result<{ savedImg: CroppedImg | null }>>;
//#endregion Types

export class CropImgUploadController {
	private state: Writable<CropControllerState>;

	private guard = <SN extends readonly StateName[]>(
		states: SN,
	): Extract<CropControllerState, { state: SN[number] }> => {
		const state = get(this.state);

		if (!states.includes(state.state)) {
			throw new Error(`Invalid state transition: From ${state.state}; Allowed: ${states.join()}`);
		}

		return state as Extract<CropControllerState, { state: SN[number] }>;
	};

	public async cancel(): Promise<void> {
		const s = get(this.state);
		if (s.state === 'canceled') return;

		if (s.state === 'image_storage_uploading') {
			s.abortUpload();
		}

		if (s.state === 'db_saving') {
			clearInterval(s.interval);
		}

		this.state.set({ state: 'canceled' });
	}

	public isCanceled(): boolean {
		return get(this.state).state === 'canceled';
	}

	constructor(state: Writable<CropControllerState>) {
		this.state = state;
	}

	/** States: any -> 'file_selecting' */
	public fileSelectStart(): void {
		this.state.set({ state: 'file_selecting' });
	}

	/** States: 'uri_loaded' -> 'cropping' */
	public startCrop(): void {
		const { uri, file } = this.guard(['uri_loaded']);
		this.state.set({ state: 'cropping', file, uri });
	}

	/** States: 'cropping' -> 'cropped' */
	public loadCropValue({ crop }: { crop: CropValue }): void {
		const { uri, file } = this.guard(['cropping']);
		this.state.set({ state: 'cropped', crop, file, uri });
	}

	/** States: 'uri_loaded' -> 'cropped' */
	public skipCrop({ crop }: { crop: CropValue } = { crop: defaultCropValue }): void {
		const { uri, file } = this.guard(['uri_loaded']);
		this.state.set({ state: 'cropped', crop, file, uri });
	}

	/** Update a preexisting image's crop value.
	 * States: 'cropping_preexisting' -> 'db_updating_preexisting' -> 'completed'
	 */
	public async saveCropValToDb({
		crop,
		saveCropToDb,
	}: {
		crop: CropValue;
		saveCropToDb: SaveCropToDb;
	}): Promise<void | DB.User['avatar']> {
		const { url } = this.guard(['cropping_preexisting']);
		const updateDbPromise = saveCropToDb({ crop });
		this.state.set({ state: 'db_updating_preexisting', updateDbPromise, crop, url });
		const { data, error } = await updateDbPromise;
		if (this.isCanceled()) return;
		if (error) return this.state.set({ state: 'error', img: { url, crop }, errorMsgs: [error.message, null] });
		this.state.set({ state: 'completed', savedImg: data.savedImg });
		return data.savedImg;
	}

	/** Delete a preexisting image.
	 * States: 'cropping_preexisting' -> 'deleting_preexisting' -> 'completed'
	 */
	public async deleteImg({ delImg }: { delImg: DeletePreexistingImg }): Promise<void | DB.User['avatar']> {
		const { crop, url } = this.guard(['cropping_preexisting']);
		const deletePreexistingImgPromise = delImg();

		this.state.set({ state: 'deleting_preexisting', deletePreexistingImgPromise, crop, url });
		const { error } = await deletePreexistingImgPromise;
		if (this.isCanceled()) return;

		if (error) return this.state.set({ state: 'error', img: { url, crop }, errorMsgs: [error.message, null] });
		this.state.set({ state: 'completed', savedImg: null });
		return null;
	}

	/** Convert a file into an in memory uri, guarding max file size.
	 * States: any -> 'uri_loading' -> 'uri_loaded'
	 * */
	public async loadFiles({ files, MAX_UPLOAD_SIZE }: { files: File[]; MAX_UPLOAD_SIZE: number }): Promise<void> {
		const file = files[0];

		if (!file) {
			return this.state.set({
				state: 'error',
				img: { url: null, crop: null },
				errorMsgs: ['No file selected', null],
			});
		}

		if (file.size > MAX_UPLOAD_SIZE) {
			return this.state.set({
				state: 'error',
				img: { url: null, crop: null },
				errorMsgs: [
					`File size (${humanReadableFileSize(file.size)}) must be less than ${humanReadableFileSize(MAX_UPLOAD_SIZE)}`,
					null,
				],
			});
		}

		const uriPromise = fileToDataUrl(file);
		this.state.set({ state: 'uri_loading', file, uriPromise });

		const { uri } = await uriPromise;
		if (this.isCanceled()) return;
		if (!uri)
			return this.state.set({
				state: 'error',
				img: { url: null, crop: null },
				errorMsgs: ['Error reading file', null],
			});
		this.state.set({ state: 'uri_loaded', file, uri });
	}

	/** Get the upload url, upload the file, and save it to the DB.
	 * States: any -> 'upload_url_fetching' -> 'image_storage_uploading' -> 'db_saving' -> 'completed'
	 * */
	private async uploadPipeline({
		file,
		uri,
		crop,
		getUploadArgs,
		upload,
		saveToDb,
	}: {
		file: File;
		uri: string;
		crop: CropValue;
		getUploadArgs: GetUploadArgs;
		upload: Upload;
		saveToDb: SaveToDb;
	}): Promise<void | DB.User['avatar']> {
		/** Get the upload url from our server (progress 3-10%) */
		const uploadProgress = tweened(0, { easing: circOut });
		const getUploadArgsPromise = getUploadArgs();
		uploadProgress.set(3);
		this.state.set({ state: 'upload_url_fetching', file, uri, crop, uploadProgress, getUploadArgsPromise });

		const getUploadArgsPromised = await getUploadArgsPromise;
		if (this.isCanceled()) return;

		if (getUploadArgsPromised.error)
			return this.state.set({
				state: 'error',
				img: { url: uri, crop },
				errorMsgs: [getUploadArgsPromised.error.message, null],
			});

		uploadProgress.set(10);

		const { bucketUrl, formDataFields } = getUploadArgsPromised.data;

		const formData = new FormData();
		for (const [key, value] of Object.entries(formDataFields)) {
			formData.append(key, value);
		}
		formData.append('file', file);

		/** Upload file to image storage (progress 10-90%) */
		const { abort: abortUpload, promise: imageUploadPromise } = upload({
			bucketUrl,
			formData,
			uploadProgress: { tweened: uploadProgress, scale: 0.9 },
		});

		this.state.set({
			state: 'image_storage_uploading',
			crop,
			uri,
			abortUpload,
			imageUploadPromise,
			uploadProgress,
		});

		const imageUploadPromised = await imageUploadPromise;
		if (this.isCanceled()) return;
		if (imageUploadPromised.error)
			return this.state.set({
				state: 'error',
				img: { url: uri, crop },
				errorMsgs: [imageUploadPromised.error.message, null],
			});

		/** Save url to db (progress 90-100%) */
		const interval = setInterval(() => {
			uploadProgress.update((v) => {
				const newProgress = Math.min(v + 1, 100);
				if (newProgress === 100) clearInterval(interval);
				return newProgress;
			});
		}, 20);

		const saveToDbPromise = saveToDb({ crop });

		this.state.set({
			state: 'db_saving',
			crop,
			uri,
			saveToDbPromise,
			interval,
			uploadProgress,
		});

		const saveToDbPromised = await saveToDbPromise;
		if (this.isCanceled()) return;

		if (saveToDbPromised.error)
			return this.state.set({
				state: 'error',
				img: { url: uri, crop },
				errorMsgs: [saveToDbPromised.error.message, null],
			});

		clearInterval(interval);
		uploadProgress.set(100);

		this.state.set({ state: 'completed', savedImg: saveToDbPromised.data.savedImg });
		return saveToDbPromised.data.savedImg;
	}

	/** States: 'cropped' -> 'upload_url_fetching' -> 'image_storage_uploading' -> 'db_saving' -> 'completed' */
	public async uploadCropped(a: {
		getUploadArgs: GetUploadArgs;
		upload: Upload;
		saveToDb: SaveToDb;
	}): Promise<void | DB.User['avatar']> {
		const { uri, file, crop } = this.guard(['cropped']);
		return await this.uploadPipeline({ ...a, crop, file, uri });
	}
}
