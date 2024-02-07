// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		interface Error {
			message: string;
		}
		type JSONError = App.Error & { status: number };

		namespace Superforms {
			type Message = { success?: never; fail: string } | { fail?: never; success: string };
		}

		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}

	namespace DB {
		type User = typeof import('$lib/db/server/schema').users.$inferSelect;
	}
}

export {};
