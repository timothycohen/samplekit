<script lang="ts" context="module">
	import imgLg from './assets/typesafe-fetch-handler-q30.webp';
	import imgSm from './assets/typesafe-fetch-handler-thumbnail-1200w.webp';
	import type { RawFrontMatter } from '$lib/articles/schema';

	export const metadata = {
		title: 'TypeSafe Fetch Handler',
		implementationPath: '/articles/typesafe-fetch-handler#demo',
		srcCodeHref:
			'https://github.com/timothycohen/samplekit/blob/main/sites/samplekit.dev/src/lib/http/client.svelte.ts',
		description: 'A typesafe fetch handler that stores the route, method, res/req types, and fetch state.',
		publishedAt: new Date('2024-03-05 20:39:38 -0500'),
		authors: [{ name: 'Tim Cohen', email: 'contact@timcohen.dev' }],
		imgSm,
		imgLg,
		tags: ['typescript', 'http', 'DX', 'client-server', 'request handlers', 'endpoints'],
		featured: true,
		updates: [{ at: new Date('2024-08-13 18:26:40 -0400'), descriptions: ['Update to runes.'] }],
	} satisfies RawFrontMatter;
</script>

<script lang="ts">
	import { CodeTopper } from '$lib/articles/components';
	import { HAnchor } from '$lib/components';
	import TabPanels from '$lib/components/TabPanels.svelte';
	import I from '$lib/icons';

	let showQuizAnswer = $state(false);

	const { data } = $props();
</script>

<HAnchor tag="h2" title="Data in SvelteKit" />

<p>There are three ways to breach the client/server divide in SvelteKit:</p>

<table>
	<tbody>
		<tr>
			<td><span class="text-sm font-light">0.1</span> </td>
			<td>Component Initialization</td>
			<td>
				<a href="https://kit.svelte.dev/docs/load" data-external>Load Functions</a>
			</td>
		</tr>
		<tr>
			<td><span class="text-sm font-light">0.2</span> </td>
			<td>Form Submissions</td>
			<td>
				<a href="https://kit.svelte.dev/docs/form-actions" data-external>Form Actions</a>
			</td>
		</tr>
		<tr>
			<td><span class="text-sm font-light">0.3</span></td>
			<td>HTTP Requests</td>
			<td>
				<a href="https://kit.svelte.dev/docs/routing#server" data-external> Request Handlers </a>
			</td>
		</tr>
	</tbody>
</table>

<p>
	<span class="text-2xl text-warning-10"> Pop quiz! </span>
	<span class="italic text-gray-12">Which are typed by SvelteKit?</span>
</p>

<p>Let's have a quick look at each of the three ways to communicate between client and server to find our answer.</p>

<HAnchor tag="h3" title="Load Functions" />

<p>
	SvelteKit does the heavy lifting here. We return data and the client automatically
	<I.Sparkles class="inline-block h-4 w-4 text-sun-moon" /> has full type safety. It works because SvelteKit writes
	<code>PageData</code> to a <code>$types.d.ts</code> file in the <code>.svelte-kit</code> folder. That folder is
	included by <code>.svelte-kit/tsconfig.json</code> which is itself included by your app's
	<code>tsconfig.json</code>.
</p>

<!-- shiki-start
```ts
export const load: PageServerLoad = async () => {
	return { name: 'Bart Simpson' as const }
}
```
shiki-end -->

<!-- shiki-start
```svelte
<script lang="ts">
	const { data } = $props(); // (property) name: "Bart Simpson"
</script>
```
shiki-end -->

<HAnchor tag="h3" title="Form Actions" />

<div>
	Like <code>PageData</code>, <code>ActionData</code> is typed the same way and applies to
	<!-- shiki-ts const { form } = $props(); shiki-ts -->
</div>

<p>
	There are also packages which expand on this with more features and the ability to easily handle multiple forms on a
	single page. My favorite is <a href="https://superforms.rocks/" data-external>SuperForms</a>.
</p>

<!-- shiki-start
```ts
const verifySMSTokenForm = await superValidate(request, zod(verifyOTPSchema));

if (!verifySMSTokenForm.valid) {
	return message(verifySMSTokenForm, { fail: 'Invalid digits' }, { status: 400 });
}
```
shiki-end -->

<HAnchor tag="h3" title="Endpoints" />

<p>By now you probably already know the answer to our little quiz.</p>

<button
	class="relative h-52 w-52 overflow-hidden rounded-badge border border-accent-5"
	onclick={() => (showQuizAnswer = !showQuizAnswer)}
>
	<div class="absolute inset-0 grid h-full w-full place-content-center bg-accent-3 {showQuizAnswer ? 'hidden' : ''}">
		<span class="text-accent-11">Reveal Answer</span>
	</div>
	<div class="absolute inset-0 h-full w-full bg-accent-2 {showQuizAnswer ? '' : 'hidden'}">
		<div class="flex h-full flex-col justify-around">
			<div class="grid grid-cols-[48px_1fr]">
				<span class="text-success-9">✓</span>
				<span class="text-left">load functions</span>
			</div>
			<div class="grid grid-cols-[48px_1fr]">
				<span class="text-success-9">✓</span>
				<span class="text-left">form actions</span>
			</div>

			<div class="grid grid-cols-[48px_1fr]">
				<span class="text-error-9">✗</span>
				<span class="text-left">http requests</span>
			</div>
		</div>
	</div>
</button>

<p>
	It's unfortunate that SvelteKit doesn't provide automatic typings for the endpoints, but its architecture makes it
	exceptionally easy to add this feature yourself. We'll focus our attention here and build a simple wrapper so our
	endpoints are as joyful to use as load functions and form actions.
</p>

<p>We'll want to change this sad and fraught code:</p>

<!-- shiki-start
```svelte
<script lang="ts">
	let loading = false;

	const loadNames = async () => {
		// Manually set loading indicator
		loading = true;

		// Pretty sure I typed the route correctly.
		const someRes = await fetch('/api/add-name', {
			method: 'POST', // Or was it PUT?
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ name: 'Tim' }), // Was it name or firstName???
		});

		if (someRes.ok) {
			const data = await someRes.json();
			// The api returns the new list of names... right?
			if (data.allNames) names = data.allNames
		} else {
			console.error('yikes! I miss TypeScript and IntelliSense!')
		}

		loading = false
	}
</script>

{#if loading}
	<p>Adding name...</p>
{/if}
```
shiki-end -->

<p>to this:</p>

<!-- shiki-start
```svelte
<script lang="ts">
	import { addNameToList } from '$routes/demos/name-list.json';

	const loadNames = async () => {
		// fully typed body. no route or method to remember
		const { data, error } = await addNameToList.send({ name: 'Tim' });
		if (error) handleError();
		else names = data.allNames; // fully typed. no response type to look up
	}
</script>

{#if addNameToList.submitting}
	<p>Adding name...</p>
{/if}
```
shiki-end -->

<HAnchor tag="h2" title="Thinking through the API" />

<HAnchor tag="h3" title="Interface" />

<p>As we saw above we know we'll need a send function and submitting state.</p>

<!-- shiki-start
```ts
interface Fetcher<ResponseData, RequestData = void> {
	submitting: boolean;
	send: (body: RequestData) => Promise<Result<ResponseData>>;
}
```
shiki-end -->

<p>
	With respect for function signatures and healthy fear of undocumented code paths, the send function is designed to
	return errors instead of throwing them. The <code>Result</code> type looks like this:
</p>

<CodeTopper title="$lib/utils/common/types/result.ts">
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html data.code['$lib/utils/common/types/result.ts'].rawHTML}
</CodeTopper>

<p>
	If we always return this type from our fetch handler, we can always destructure
	<code>&lbrace; data, error &rbrace;</code>. Verifying the existence of one will make TS know the other is
	<code>undefined</code>.
</p>

<p>
	Superforms has a few nice features that are worth copying over to our fetch API. <code>submitting</code> switches to
	<code>true</code> as soon as the request is sent.
	<a href="https://superforms.rocks/concepts/timers#loading-indicators" data-external>As Superforms explains</a>, it's
	often better to wait a bit before showing the loading indicator. This is especially true for fast requests, where the
	loading indicator can be more distracting than helpful. With that in mind, let's imitate their <code>delayed</code>
	and <code>timeout</code> stores.
</p>

<!-- shiki-start
```ts
interface Fetcher<ResponseData, RequestData = void> {
	submitting: boolean;
	delayed: boolean;//!d"diff-add"
	timeout: boolean;//!d"diff-add"
	send: (body: RequestData) => Promise<Result<ResponseData>>;
}
```
shiki-end -->

<HAnchor tag="h3" title="Server / Client Separation" />
<p>
	Server endpoint handlers and client fetch wrappers should be co-located, but fully distinct and impossible to mix up.
</p>

<p>
	Let's declare that every endpoint has a <code>*.json</code> folder. Inside is a <code>+server.ts</code> with
	<code>RequestHandler</code>s and an <code>index.ts</code> file with types and client fetch wrappers.
</p>

<p>
	It's already easy to understand what's going on because the files are side by side, but for uniformity and ease of
	search, I name the server endpoint handler and client fetch wrapper the same thing. Explicit naming instead of lambdas
	serves as a form of documentation.
</p>

<CodeTopper title="$routes/demos/name-list.json/+server.ts">
	<!-- shiki-start
```ts
const addNameToList = async ({ locals, request }: RequestEvent) => { ... };
export const PUT: RequestHandler = addNameToList;
```
shiki-end -->
</CodeTopper>

<CodeTopper title="$routes/demos/name-list.json/index.ts">
	<!-- shiki-start
```ts
type PutReq = { name: string };
export type PutRes = { allNames: string[] };
export const addNameToList = new ClientFetcher();
```
shiki-end -->
</CodeTopper>

<HAnchor tag="h3" title="Hiding the route / method / types" />

<p>
	The caller shouldn't need to know the route or the method. That should be defined by the wrapper. Also, the body and
	response should be fully typed, which means <code>ClientFetcher</code> will have to be generic.
</p>

<p>
	SvelteKit even exports a <code>RouteId</code> type, which means we can make it so that if we rename the folder
	containing our endpoint, we get a <span class="underline decoration-error-9 decoration-wavy">compile error</span>!
	Love ya SvelteKit!
</p>

<CodeTopper title="$routes/demos/name-list.json/index.ts">
	<!-- shiki-start
```ts
import type { RouteId } from './$types';//!d"diff-add"

type PutReq = { name: string };
export type PutRes = { allNames: string[] };
export const addNameToList = new ClientFetcher();//!d"diff-remove"
export const addNameToList = new ClientFetcher<RouteId, PutRes, PutReq>('PUT', '/demos/name-list.json');//!d"diff-add"
```
shiki-end -->
</CodeTopper>

<HAnchor tag="h3" title="Enforce server / client type consistency" />

<p>
	How do we enforce that we actually return the type we say we're returning from the endpoint? We need to ensure we
	always return the correct <code>Result</code> type from our endpoint handlers. Let's create two helpers to make it
	easy: <code>jsonOk</code> and <code>jsonFail</code>. As a bonus, we'll make sure the error inherits the type from
	<code>App.JSONError</code> so we have a single source of truth for error types.
</p>

<CodeTopper title="app.d.ts">
	<!-- shiki-start
```ts
declare global {
	namespace App {
		interface Error {
			message: string;
		}
		type JSONError = App.Error & { status: number };
		...
	}//!d"hide"
}//!d"hide"
```
shiki-end -->
</CodeTopper>

{#snippet Server()}
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html data.code['$lib/http/server/json.ts'].rawHTML}
{/snippet}

{#snippet Common()}
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html data.code['$lib/http/common.ts'].rawHTML}
{/snippet}

<TabPanels
	files={[
		{ title: '$lib/http/server/json.ts', snippet: Server },
		{ title: '$lib/http/common.ts', snippet: Common },
	]}
/>

<p>
	Back in our endpoint, we can now use our types and functions to make the endpoint handler fully typed and consistent.
</p>

<CodeTopper title="$routes/demos/name-list.json/+server.ts">
	<!-- shiki-start
```ts
const addNameToList = async ({ locals, request }: RequestEvent) => {
	return jsonFail(403);
	// or
	return jsonOk<GetRes>(res);
};
export const PUT: RequestHandler = addNameToList;
```
shiki-end -->
</CodeTopper>

<HAnchor tag="h3" title="Dynamic Routes" />

<p>
	We're almost done designing the API. However, we've so far assumed the route is static. What if it's
	<code>/demos/[id]/name</code> instead? We can make another flavor of <code>ClientFetcher</code> that takes a function
	to create the url. Let's call it <code>DynClientFetcher</code>.
</p>

<CodeTopper title="$routes/demos/[id]/name/index.ts">
	<!-- shiki-start
```ts
type PutReq = { name: string };
export type PutRes = { allNames: string[] };
export const addNameToList = new DynClientFetcher<PutRes, PutReq, { id: string }>('PUT', ({ id }) => `/demos/${id}/name.json`);
```
shiki-end -->
</CodeTopper>

<HAnchor tag="h3" title="Options" />

<p>The final consideration is to accept some control options.</p>

<!-- shiki-start
```ts
type LocalOpts = {
	invalidate?: boolean;
	preventDuplicateRequests?: boolean;
	delayMs?: number;
	timeoutMs?: number;
	abortSignal?: AbortSignal;
};
type GlobalOpts = { invalidate?: true; preventDuplicateRequests?: true };

interface Fetcher<ResponseData, RequestData = void> {
	submitting: boolean;
	delayed: boolean;
	timeout: boolean;
	send: (body: RequestData, localOpts?: LocalOpts) => Promise<Result<ResponseData>>;
}
```
shiki-end -->

<HAnchor tag="h2" title="Implementation" />

<p>We're finally ready to implement.</p>

<CodeTopper title="$lib/http/client.svelte.ts">
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html data.code['$lib/http/client.svelte.ts'].rawHTML}
</CodeTopper>

<HAnchor tag="h2" title="Conclusion" />

<p>
	I really enjoy working with this API. With only around a hundred lines of code, loading states are baked in, errors
	are accounted for, and type / route / method checks are all moved to compile time. Do you use something similar? Have
	you found an even better way? Share it in the
	<a href="https://github.com/timothycohen/samplekit/discussions" data-external>GitHub discussions</a>!
</p>
