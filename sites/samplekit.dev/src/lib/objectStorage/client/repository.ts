import { uploadToCloudStorage } from './uploadToCloudStorage';
import type { ObjectStorageClient } from './types';

export const objectStorage: ObjectStorageClient = {
	upload: uploadToCloudStorage,
};
