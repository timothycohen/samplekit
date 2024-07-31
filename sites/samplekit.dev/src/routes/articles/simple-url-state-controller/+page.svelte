<script lang="ts">
	import { CodeTopper } from '$lib/articles/components';
	import { HAnchor } from '$lib/components';
	import { searchParam } from '$lib/stores';
	import { ArrowUp, X, Check } from '$lib/styles/icons';

	const setSwitch = searchParam('set-switch');
	const toggleSwitch = searchParam('toggle-switch');
	const singleSearchParam = searchParam('single-search-param');
	const easter = searchParam('easter', { clean: (v) => (v === 'egg' ? '🐰' : v) });
</script>

<p>
	Storing state in the url is a useful pattern which allows the state to be shared or recovered through a link. This
	pattern might be used for a share button, a bookmark, an internal link to some initial state, or to restore state
	after completing another flow.
</p>

<p>
	In this article, we'll create controllers for the search param state that we can use just as easily as regular svelte
	stores. We'll put them to use by storing the filter state of posts in the URL as in the demo above.
</p>

<HAnchor tag="h2" title="Thinking through the API" />

<p>
	Odds are, we'll likely want to separate the API for single and multi-value search params. The stored values should be
	identical to <code>URLSearchParams</code>. For single values, that's <code>string | null</code>. For multi-values,
	that's <code>string[]</code>.
</p>

<!-- md-start
| Param Count | Equivalent <code>$page</code> fn                  | Example                                     |
| ----------- | ------------------------------------------------- | ------------------------------------------- |
| 1           | <code>$page.url.searchParams.get(param)</code>    | <code>?content=foo</code>                   |
| 2+          | <code>$page.url.searchParams.getAll(param)</code> | <code>?authors=Xavier&authors=Olivia</code> |
md-end -->

<!-- shiki-start
```ts
const content = searchParam('content');
const authors = searchParams('authors');
```
shiki-end -->

<p>
	We know our controller will need to include a reactive store with the current value of the desired search param, so
	let's create that first.
</p>

<!-- shiki-start
```ts
import { page } from '$app/stores';
import { derived, get } from 'svelte/store';

const searchParam: (param: string) => {
	const store = derived(page, ($page) => $page.url.searchParams.get(param));

	return {
		subscribe: store.subscribe,
	}
}

const searchParams: (param: string) => {
	const store = derived(page, ($page) => $page.url.searchParams.getAll(param));

	return {
		subscribe: store.subscribe,
	}
}
```
shiki-end -->

<HAnchor tag="h2" title="Single value search param" />

<HAnchor tag="h3" title="API" />

<HAnchor tag="h4" title="Fulfilling the Store Contract" />

<p>Our single value controller should be as simple to use as a regular store.</p>

<!-- shiki-start
```ts
const store = writable<string | null>(null)
$store = 'hello';

const paramStore = searchParam('param'); // $paramStore is string | null
$paramStore = 'hello'; // navigates to ?param=hello
```
shiki-end -->

<p>
	For <code>$paramStore = 'hello'</code> to work, we need to fulfil Svelte's <code>Store</code> interface with a
	<code>set</code> method. <code>paramStore.set('hello')</code> should add <code>?param=hello</code> to the url, causing
	our derived store to update and notify all subscribers.
</p>

<!-- shiki-start
	```ts
interface SearchParamController {
	subscribe: Readable<string | null>['subscribe'];
	set: (value: string | null) => void;
}
```
shiki-end -->

<HAnchor tag="h4" title="Convenience Methods" />

<p>
	Ideally we'd have a convenience function to toggle it too.
	<code>paramStore.toggle('hello')</code> should set the search to <code>?param=hello</code> if it's not already set,
	and <code>null</code> if it is.
</p>

<!-- shiki-start
	```ts
interface SearchParamController {
	subscribe: Readable<string | null>['subscribe'];
	set: (value: string | null) => void;
	toggle: (value: string) => void;
}
```
shiki-end -->

<p>
	Great! But what if the url state is set to <code>?param=foo</code> and we call <code>paramStore.toggle('bar')</code>?
	Should it be <code>?param=bar</code> or <code>null</code>? Most likely, we'll want to switch it to <code>'bar'</code>
	and then another <code>.toggle('bar')</code> call will switch it to <code>null</code>.
</p>

<div class="grid space-y-4 sm:grid-cols-2">
	<fieldset>
		<legend class="text-sm"><code>{`.set(value):`}</code></legend>
		{#each ['foo', 'bar'] as switch_id}
			<div>
				<input
					type="radio"
					name="set_switch"
					id="set_{switch_id}"
					value={switch_id}
					checked={$setSwitch === switch_id}
					onclick={() => setSwitch.set(switch_id)}
				/>
				<label for="set_{switch_id}">{switch_id}</label>
			</div>
		{/each}
		<button class="btn btn-hollow" onclick={() => setSwitch.set(null)}>clear</button>
	</fieldset>

	<fieldset>
		<legend class="text-sm"><code>{`.toggle(value):`}</code></legend>
		{#each ['foo', 'bar'] as switch_id}
			<div>
				<input
					type="radio"
					name="toggle_switch"
					id="toggle_{switch_id}"
					value={switch_id}
					checked={$toggleSwitch === switch_id}
					onclick={() => toggleSwitch.toggle(switch_id)}
				/>
				<label for="toggle_{switch_id}">{switch_id}</label>
			</div>
		{/each}
	</fieldset>
</div>

<HAnchor tag="h4" title="Multiple Params" />

<p>
	We may want to update multiple params before actually navigating to the new page. This is especially important if we
	need to clean the url (we'll show an example shortly!). For that reason, let's make a <code>mutateSearchParams</code>
	function. <code>set</code> will be a small wrapper that calls it and navigates. <code>pushStateToParams</code> will just
	update the state but not navigate.
</p>

<!-- shiki-start
```ts
interface SearchParamController {
	subscribe: Readable<string | null>['subscribe'];
	mutateSearchParams: (a: { newValue?: string | null; mutSearchParams: URLSearchParams }) => false | URLSearchParams;
	pushStateToParams: (a: { mutSearchParams: URLSearchParams }) => false | URLSearchParams
	set: (value: string | null) => void;
	toggle: (value: string) => void;
}
```
shiki-end -->

<HAnchor tag="h4" title="Result" />

<p>
	We'll probably want to know whether the <code>set</code> or <code>toggle</code> functions were successful, and be able
	to await their navigation if so.
</p>

<!-- shiki-start
```ts
/** `false` if the value is not changed, `Promise<false>` if called on the server, and `Promise<true>` if the value and url change */
type Changed = false | Promise<boolean>;

interface SearchParamController {
	subscribe: Readable<string | null>['subscribe'];
	mutateSearchParams: (a: { newValue?: string | null; mutSearchParams: URLSearchParams }) => false | URLSearchParams;
	pushStateToParams: (a: { mutSearchParams: URLSearchParams }) => false | URLSearchParams
	set: (value: string | null) => Changed;
	toggle: (value: string) => Changed;
}
```
shiki-end -->

<HAnchor tag="h4" title="Go Options" />

<p>
	And lastly, if the input (for example a search bar) is in a layout, we may or may not need to change the
	<code>url.pathname</code> and not just the <code>url.search</code>. We'll add some go options to our <code>set</code>
	and <code>toggle</code> functions.
</p>

<!-- shiki-start
```ts
type GoOpts = { absolute?: string };

/** `false` if the value is not changed, `Promise<false>` if called on the server, and `Promise<true>` if the value and url change */
type Changed = false | Promise<boolean>;

interface SearchParamController {
	subscribe: Readable<string | null>['subscribe'];
	mutateSearchParams: (a: { newValue?: string | null; mutSearchParams: URLSearchParams }) => false | URLSearchParams;
	pushStateToParams: (a: { mutSearchParams: URLSearchParams }) => false | URLSearchParams
	set: (value: string | null, opts?: GoOpts) => Changed;
	toggle: (value: string, opts?: GoOpts) => Changed;
}
```
shiki-end -->

<HAnchor tag="h3" title="Implementation" />

<p>We've got a solid API, so let's write the implementation.</p>

<p>
	The main mechanism will be to navigate with <code>goto</code> and let our derived store handle the state changes.
	We'll do this by getting the search params of the current page, adding or deleting the new param, and using
	<code>goto</code> to update the url.
</p>

<HAnchor tag="h4" title="Helpers" />

<p>
	<code>goto</code> takes a few options that we'll need to turn on for every call, so let's make a wrapper called
	<code>go</code>. <code>replaceState: true</code> will allow the user to go back to the previous page with the back
	button, skipping all the previous state changes. <code>keepFocus</code> and <code>noScroll</code> will also need to be
	switched on. Finally, we'll add in our <code>absolute</code> option.
</p>

<!-- shiki-start
```ts
type GoOpts = { absolute?: string };

export const go = async (searchParams: URLSearchParams, opts?: GoOpts) => {
	if (browser) {
		return goto(`${opts?.absolute ?? ''}?${searchParams}`, {
			keepFocus: true,
			noScroll: true,
			replaceState: true,
		}).then(() => true);
	} else {
		return false;
	}
};
```
shiki-end -->

<p>
	Notice we're taking in <code>searchParams</code>, but we know that the <code>$page</code> store will not update if we
	simply mutate the <code>searchParams</code>. It must be a new reference.
</p>

<div class="alert-wrapper alert-wrapper-warning mb-6 text-base">
	<p class="alert-header">
		<strong>Svelte 4 subscriptions are notified on assignment changes, not internal mutations.</strong>
	</p>
	<p class="flex items-center gap-4">
		<X class="text-error-9" /> Mutable reference to $page.url.searchParams
	</p>
	<p class="flex items-center gap-4">
		<Check class="text-success-9" /> <span>New object created from $page.url.searchParams</span>
	</p>
</div>

<!-- shiki-start
```ts
// const searchParams = get(page).url.search; // this will not update $page when goto is called
const searchParams = new URLSearchParams(get(page).url.search); // will update $page
searchParams.set('foo', 'bar');
goto(searchParams.toString())
```
shiki-end -->

<p>So let's make a <code>cloneParams</code> helper.</p>

<!-- shiki-start
```ts
const cloneParams = () => new URLSearchParams(get(page).url.search);
```
shiki-end -->

<HAnchor tag="h4" title="searchParam" />

<p>One possible implementation:</p>

<!-- shiki-start
```ts
/**`$store` is equivalent to $page.url.searchParams.get(param) */
export const searchParam = (name: string): SearchParamController => {
	const store = derived(page, ($page) => $page.url.searchParams.get(name));

	const mutateSearchParams: SearchParamController['mutateSearchParams'] = ({ newValue, mutSearchParams }) => {
		if (mutSearchParams.get(name) === newValue) {
			return false;
		}
		if (!newValue) mutSearchParams.delete(name);
		else mutSearchParams.set(name, newValue);
		return mutSearchParams;
	};

	const pushStateToParams = ({ mutSearchParams }: { mutSearchParams: URLSearchParams }): false | URLSearchParams => {
		return mutateSearchParams({ mutSearchParams, newValue: get(page).url.searchParams.get(name) });
	};

	const set: SearchParamController['set'] = (newValue, opts) => {
		const newParams = mutateSearchParams({ newValue, mutSearchParams: cloneParams() });
		return newParams ? go(newParams, opts) : false;
	};

	const toggle: SearchParamController['toggle'] = (newValue, opts) => {
		const mutSearchParams = cloneParams();
		const oldValue = mutSearchParams.get(name);
		const newParams = mutateSearchParams({ newValue: newValue === oldValue ? null : newValue, mutSearchParams });
		return newParams ? go(newParams, opts) : false;
	};

	return {
		subscribe: store.subscribe,
		mutateSearchParams,
		pushStateToParams,
		set,
		toggle,
	};
};
```
shiki-end -->

<HAnchor tag="h3" title="Adding Validation" />

<p>
	We now have a working implementation, but there's something we could add: bounds. This implementation expects the
	consumer to provide any cleaning logic before calling the methods. Even if they did so, anyone could manipulate the
	url directly and the values would be unclean. Let's fix that by adding an optional callback to clean the value. The
	<code>mutateSearchParams</code> method will be able to accept either a cleaned or unclean value and call the clean function
	when necessary.
</p>

<!-- shiki-start
```ts
interface SearchParamController {
	subscribe: Readable<string | null>['subscribe'];
	mutateSearchParams: (a: {
		value?: { cleaned?: never; unclean?: string | null } | { cleaned?: string | null; unclean?: never };
		mutSearchParams: URLSearchParams;
	}) => false | URLSearchParams;
	pushStateToParams: (a: { mutSearchParams: URLSearchParams }) => false | URLSearchParams;
	set: (unclean: string | null, opts?: GoOpts) => Changed;
	toggle: (unclean: string, opts?: GoOpts) => Changed;
}
```
shiki-end -->

<p>
	As our initial value may also be unclean (for example if the user navigates to <code>?param=unclean</code> directly),
	we'll also add an <code>init</code> function that invokes the clean function.
</p>

<p>
	The <strong class="font-bold">final</strong> consideration before we implement the
	<strong class="font-bold">final</strong> version of our <code>searchParam</code> controller is that we won't always be
	able to handle the cleaning logic on initialization. If a user goes to
	<code class="text-nowrap">?param1=unclean&amp;param2=also_unclean</code> directly, the first init function would clean
	and <code>goto</code> <code class="text-nowrap">?param1=clean&amp;param2=also_unclean</code>, but the second
	<code>goto</code> would run concurrently and be lost. Because of this, we'll make sure to have an option to skip the
	initial <code>goto</code> call, so the consumer can run it after all the controllers have initialized.
</p>

<p>First, let's implement it and then we'll have a look at what the cleaning looks like in practice.</p>

<p>One possible implementation:</p>

<CodeTopper title="searchParam.ts">
	<!-- shiki-start
```ts
export const searchParam = (
	name: string,
	{ clean, skipInitGoto }: { clean?: (value: string | null) => string | null; skipInitGoto?: true } = {},
): SearchParamController => {
	const store = derived(page, ($page) => $page.url.searchParams.get(name));
	const serialize = clean || ((v) => v || null);

	const init = (): void => {
		if (skipInitGoto) return;
		set(get(store));
	};

	/** If mutSearchParams are updated, returns a reference to it. Otherwise returns false. */
	const mutateSearchParams: SearchParamController['mutateSearchParams'] = ({ value, mutSearchParams }) => {
		const newValue = value?.cleaned ?? serialize(value?.unclean ?? null);
		if (mutSearchParams.get(name) === newValue) {
			return false;
		}
		if (!newValue) mutSearchParams.delete(name);
		else mutSearchParams.set(name, newValue);
		return mutSearchParams;
	};

	const pushStateToParams: SearchParamController['pushStateToParams'] = ({ mutSearchParams }) => {
		return mutateSearchParams({ mutSearchParams, value: { unclean: get(page).url.searchParams.get(name) } });
	};

	const set: SearchParamController['set'] = (unclean, opts) => {
		const newParams = mutateSearchParams({ value: { unclean }, mutSearchParams: cloneParams() });
		return newParams ? go(newParams, opts) : false;
	};

	const toggle: SearchParamController['toggle'] = (unclean, opts) => {
		const mutSearchParams = cloneParams();
		const oldValue = mutSearchParams.get(name);
		const newValue = serialize(unclean);
		const newParams = mutateSearchParams({
			value: { cleaned: newValue === oldValue ? null : newValue },
			mutSearchParams,
		});
		return newParams ? go(newParams, opts) : false;
	};

	init();

	return {
		subscribe: store.subscribe,
		mutateSearchParams,
		pushStateToParams,
		set,
		toggle,
	};
};
```
shiki-end -->
</CodeTopper>

<HAnchor tag="h3" title="Demo" />

<p>Now let's use it! Try it out below.</p>

<!-- shiki-start
```svelte
<script lang="ts">
	import { searchParam } from '$lib/stores';

	const singleSearchParam = searchParam('single-search-param');
	const easter = searchParam('easter', { clean: (v) => (v === 'egg' ? '🐰' : v) });
</script>

<input type="text" bind:value={$singleSearchParam} />
<input type="text" bind:value={$easter} />
```
shiki-end -->

<div class="space-y-4">
	<label for="single-search-param" class="input-label flex gap-2"><ArrowUp class="h-4 w-4" /> Check the URL</label>
	<input type="text" bind:value={$singleSearchParam} id="single-search-param" class="peer input-text max-w-48" />

	<label for="easter" class="input-label flex gap-2">Try to type "egg" or use your browser to go to ?easter=egg.</label>
	<input type="text" bind:value={$easter} id="easter" class="peer input-text max-w-48" />
</div>

<p>
	As mentioned before, we won't be able to rely on <code>init</code> when using multiple validation params on a single
	page. If the user went to <code>?easter=easter&egg=egg</code> when our code looked like this:
</p>

<!-- shiki-start
```ts
const easter = searchParam('easter', { clean: (v) => (v === 'easter' ? '🐰' : v) });
const egg = searchParam('egg', { clean: (v) => (v === 'egg' ? '🐰' : v) });
```
shiki-end -->

<p>The user would end up at <code>?easter=🐰&egg=egg</code>.</p>

<p>
	But because we have a separate <code>pushStateToParams</code> method and a <code>skipInitGoto</code> option, we can handle
	this with a simple standalone helper.
</p>

<!-- shiki-start
```ts
export const initMany = (params: Array<SearchParamController | SearchParamsController>): Changed => {
	const mutSearchParams = cloneParams();

	const changed = params.reduce<boolean>((acc, curr) => {
		const changed = !!curr.pushStateToParams({ mutSearchParams });
		return acc || changed;
	}, false);

	if (!changed) return false;
	return go(mutSearchParams);
};
```
shiki-end -->

<!-- shiki-start
```ts
const easter = searchParam('easter', { clean: (v) => (v === 'easter' ? '🐰' : v), skipInitGoto: true });
const egg = searchParam('egg', { clean: (v) => (v === 'egg' ? '🐰' : v), skipInitGoto: true });
initMany([easter, egg]);
```
shiki-end -->

<p>
	Now our user will be redirected from <code>?easter=easter&egg=egg</code> to
	<code>?easter=🐰&egg=🐰</code> immediately as desired.
</p>

<HAnchor tag="h2" title="Multi-value search params" />

<HAnchor tag="h3" title="API" />

<p>Our multi-value controller's helper functions will be a little more detailed.</p>

<p>
	If our tags are <code>?tags=foo&tags=bar</code>, we'll need to be able to add, append, remove, and toggle a value.
</p>

<!-- md-start
| Action | Example                                      | Result                                   |
| ------ | -------------------------------------------- | ---------------------------------------- |
| add    | <code>tags.updateOne('baz', 'add')</code>    | <code>?tags=foo&tags=bar&tags=baz</code> |
| remove | <code>tags.updateOne('bar', 'remove')</code> | <code>?tags=foo</code>                   |
| append | <code>tags.updateOne('bar', 'append')</code> | <code>?tags=foo&tags=bar&tags=bar</code> |
| toggle | <code>tags.updateOne('bar', 'toggle')</code> | <code>?tags=foo</code>                   |
md-end -->

<p>Likewise, we should be able to do the same thing for multiple values.</p>

<p>
	It'll also be nice to have a <code>set</code> method so we can use the syntactic <code>$store = value</code> syntax.
</p>

<!-- shiki-start
```ts
interface SearchParamsController {
	subscribe: SearchParams['subscribe'];
	mutateSearchParams: (a: { unclean?: string[]; mutSearchParams: URLSearchParams }) => false | URLSearchParams;
	set: (values: string[]) => false | Promise<boolean>;
	updateOne: (value: string, action: 'add' | 'append' | 'remove' | 'toggle') => false | Promise<boolean>;
	updateMany: (values: string[], action: 'add' | 'append' | 'remove' | 'toggle') => false | Promise<boolean>;
}
```
shiki-end -->

<HAnchor tag="h3" title="Implementation" />

<p>The ideas are the same, so we'll skip straight to the code. Here's one possible implementation.</p>

<CodeTopper title="searchParams.ts">
	<!-- shiki-start
	```ts
/** `$store` is equivalent to $page.url.searchParams.getAll(`${param}`) */
/** `$store` is equivalent to $page.url.searchParams.getAll(`${param}`) */
export const searchParams = (
	param: string,
	{ clean, skipInitGoto }: { clean?: (value: string | null) => string | null; skipInitGoto?: true } = {},
) => {
	const store = derived(page, ($page) => $page.url.searchParams.getAll(`${param}`));
	const serialize = clean || ((v) => v || null);

	const init = (): void => {
		if (skipInitGoto) return;
		set(get(store));
	};

	/** If mutSearchParams are updated, returns a reference to it. Otherwise returns false. */
	const mutateSearchParams: SearchParamsController['mutateSearchParams'] = ({ unclean, mutSearchParams }) => {
		const preMutatedParams = new URLSearchParams(mutSearchParams);
		mutSearchParams.delete(param);
		unclean?.forEach((v) => {
			const cleaned = serialize(v);
			if (cleaned) mutSearchParams.append(param, cleaned);
		});
		if (preMutatedParams.toString() !== mutSearchParams.toString()) return mutSearchParams;
		return false;
	};

	const pushStateToParams: SearchParamsController['pushStateToParams'] = ({ mutSearchParams }) => {
		return mutateSearchParams({ mutSearchParams, unclean: get(page).url.searchParams.getAll(param) });
	};

	const set: SearchParamsController['set'] = (unclean, opts) => {
		const newParams = mutateSearchParams({ unclean, mutSearchParams: cloneParams() });
		return newParams ? go(newParams, opts) : false;
	};

	const updateOne: SearchParamsController['updateOne'] = (unclean, action, opts) => {
		const value = serialize(unclean);
		if (value === null) return false;
		const mutSearchParams = cloneParams();

		if (action === 'append') {
			mutSearchParams.append(param, value);
			return go(mutSearchParams, opts);
		}

		const paramValues = mutSearchParams.getAll(param);
		const index = paramValues.findIndex((p) => p === value);

		if (index === -1) {
			if (action === 'remove') return false;
			mutSearchParams.append(param, value);
			return go(mutSearchParams, opts);
		} else {
			if (action === 'add') return false;
			paramValues.splice(index, 1);
			mutSearchParams.delete(param);
			paramValues.forEach((p) => mutSearchParams.append(param, p));
			return go(mutSearchParams, opts);
		}
	};

	const updateMany: SearchParamsController['updateMany'] = (unclean, action, opts) => {
		const values = unclean.map(serialize).filter((v) => v !== null) as string[];
		if (!values.length) return false;

		const mutSearchParams = cloneParams();

		let changed = false;

		switch (action) {
			case 'append': {
				changed = true;
				for (const value of values) {
					mutSearchParams.append(param, value);
				}
				break;
			}
			case 'add': {
				const paramSet = new Set(mutSearchParams.getAll(param));
				for (const value of values) {
					if (!paramSet.has(value)) {
						changed = true;
						mutSearchParams.append(param, value);
					}
				}
				break;
			}
			case 'remove': {
				const paramValues = mutSearchParams.getAll(param);
				for (const value of values) {
					const index = paramValues.findIndex((p) => p === value);
					if (index !== -1) {
						changed = true;
						paramValues.splice(index, 1);
					}
				}
				if (changed) {
					mutSearchParams.delete(param);
					paramValues.forEach((p) => mutSearchParams.append(param, p));
				}
				break;
			}
			case 'toggle': {
				const paramValues = mutSearchParams.getAll(param);
				changed = true;
				for (const value of values) {
					const index = paramValues.findIndex((p) => p === value);
					if (index !== -1) {
						paramValues.splice(index, 1);
					} else {
						paramValues.push(value);
					}
				}
				mutSearchParams.delete(param);
				paramValues.forEach((p) => mutSearchParams.append(param, p));
				break;
			}
			default: {
				assertUnreachable(action);
			}
		}

		if (changed) return go(mutSearchParams, opts);
		return false;
	};

	init();

	return {
		subscribe: store.subscribe,
		mutateSearchParams,
		pushStateToParams,
		set,
		updateOne,
		updateMany,
	};
};
```
shiki-end -->
</CodeTopper>

<HAnchor tag="h2" title="Conclusion" />

<p>
	And that's it! We've created a simple wrapper around a derived store that syncs application state with the URL. This
	is everything we need to write the demo at the top of the article.
	<a
		href="https://github.com/timothycohen/samplekit/tree/main/sites/samplekit.dev/src/routes/articles/simple-url-state-controller/live-demos/main"
		data-external
	>
		Full code here
	</a>.
</p>

<p>
	If you're following along closely, you've noticed we made a design decision early on that has knock-on effects. We
	decided to use <code>$page</code> as the single source of truth for our store value. This decision makes sense when
	the highest priority is syncing the url and store state. However, it does have some limitations. Namely, there is a
	short duration between store initialization and the first <code>goto</code> where the state is unclean. Also, we can't
	use generics to type our store. We might instead want to accept that the url and store state will be out of sync during
	construction as a tradeoff to receive an infallible, generic store.
</p>

<p>
	In <a href="/articles/generic-url-state-controller">part 2</a>, we'll make another variation which will have the
	following benefits:
</p>

<ul>
	<li>The store can never be "unclean".</li>
	<li>The store is generic, so we can logically group and clean parameters together (for example min/max values).</li>
	<li>The store can be injected into other code (like melt-ui).</li>
</ul>

<p>
	Have any questions or comments? Share it in the
	<a href="https://github.com/timothycohen/samplekit/discussions" data-external>GitHub discussions</a>! Thanks for
	reading and see you in the <a href="/articles/generic-url-state-controller">next one</a>!
</p>
