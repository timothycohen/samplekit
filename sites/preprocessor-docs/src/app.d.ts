// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
	module '*.svx' {
		const component: import('svelte').ComponentType<import('svelte').SvelteComponent>;
		export default component;
	}
}

export {};
