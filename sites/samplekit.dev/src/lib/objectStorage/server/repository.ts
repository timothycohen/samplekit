import { invalidateCloudfront } from './cloudfront';
import { detectModerationLabels } from './rekognition';
import { clearBucket, deleteS3Object, generateS3UploadPost } from './s3';
import { s3CloudfrontKeyController } from './s3CloudfrontKeyController';
import { createUnsavedUploadCleaner } from './unsavedUploadsCleaner';
import type { ObjectStorage } from './types';

export const objectStorage: ObjectStorage = {
	delete: deleteS3Object,
	deleteAll: clearBucket,
	detectModerationLabels: detectModerationLabels,
	invalidateCDN: invalidateCloudfront,
	generateUploadFormDataFields: generateS3UploadPost,
	createUnsavedUploadCleaner: createUnsavedUploadCleaner,
	keyController: s3CloudfrontKeyController,
};
