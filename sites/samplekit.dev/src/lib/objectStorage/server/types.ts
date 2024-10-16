export type ObjectStorage = {
	delete: (a: { key: string; guard: null | (() => boolean) }) => Promise<boolean>;
	deleteAll: () => Promise<{ deletedCount: number }>;
	detectModerationLabels: (a: {
		s3Key: string;
		confidence?: number;
	}) => Promise<{ error: App.Error } | { error: undefined }>;
	invalidateCDN: (a: { keys: string[] }) => Promise<boolean>;
	createUnsavedUploadCleaner: (a: {
		getStoredUrl: (a: { userId: string }) => Promise<string | null | undefined>;
		jobDelaySeconds: number;
	}) => {
		addDelayedJob: (a: { cdnUrl: string; userId: string }) => void;
		removeJob: (a: { cdnUrl: string }) => void;
	};
	generateUploadFormDataFields: (a: {
		key: string;
		maxContentLength?: number;
		expireSeconds?: number;
	}) => Promise<{ url: string; formDataFields: { [key: string]: string } } | null>;
	keyController: {
		transform: {
			keyToObjectUrl: (key: string) => string;
			keyToCDNUrl: (key: string) => string;
			objectUrlToKey: (url: string) => string;
			objectUrlToCDNUrl: (url: string) => string;
			cdnUrlToKey: (url: string) => string;
			cdnUrlToObjectUrl: (url: string) => string;
		};
		is: {
			objectUrl: (url?: string | undefined) => url is string;
			cdnUrl: (url?: string | undefined) => url is string;
		};
		create: {
			root: () => string;
			user: { avatar: (a: { userId: string }) => string };
		};
		parse: {
			root: (key: string) => { dbName: string } | null;
			user: { avatar: (key: string) => { userId: string; id: string; dbName: string } | null };
		};
		guard: {
			root: (a: { key: string }) => boolean;
			user: { avatar: (a: { key: string; ownerId: string }) => boolean };
		};
	};
};
