<script lang="ts" module>
	import { TabPanelItem } from '$lib/components';
	import imgSm from './assets/generic-url-state-controller-thumbnail-1200w.webp';
	import type { RawFrontMatter } from '$lib/articles/schema';

	export const metadata = {
		title: 'Generic URL State Controller',
		implementationPath: '/articles/generic-url-state-controller#demo',
		srcCodeHref:
			'https://github.com/timothycohen/samplekit/tree/main/sites/samplekit.dev/src/routes/articles/generic-url-state-controller',
		description: 'Sync validated, generic store state to the URL with a flexible API.',
		publishedAt: new Date('2024-03-08 13:31:26 -0500'),
		authors: [{ name: 'Tim Cohen', email: 'contact@timcohen.dev' }],
		imgSm,
		tags: ['url', 'state management', 'generics', 'context api', 'TypeScript'],
		featured: false,
		series: { name: 'URL State Controller', position: 2 },
	} satisfies RawFrontMatter;
</script>

<script lang="ts">
	import CodeTopper from '$lib/articles/components/CodeTopper.svelte';
	import { HAnchor, Admonition, TabPanels } from '$lib/components';

	const { data } = $props();
</script>

<p>
	We <a href="/articles/simple-url-state-controller">previously made a simple URL state controller</a> whose state was
	derived from <code>$page.url.searchParams</code>. Creating and using it is as simple as a regular store.
</p>

<!-- shiki-start
```svelte
<script lang="ts">
	import { writable } from 'svelte/store'
	import { searchParams, searchParam } from '$lib/stores';

	const store = writable<string | null>(null)
	$store = 'hello';

	const storeArr = writable<string[]>([])
	$storeArr = ['hello', 'world'];

	const param = searchParam('param'); // $param is string | null
	$param = 'hello'; // navigates to ?param=hello

	const paramsStore = searchParams('params'); // $paramsStore is string[]
	$paramsStore = ['hello', 'world']; // navigates to ?params=hello&params=world
</script>

<input type="text" bind:value={$param} />
&openhtmlcomment; or &closehtmlcomment;
<input type="text" value={$param} onblur={(e) => ($param = e.currentTarget.value)} />
```
shiki-end -->

<p>
	However, as discussed in the conclusion, the derived state implementation has pros and cons. It's simple, and the url
	/ store state are always in sync, but let's consider a more complex example to investigate the drawbacks.
</p>

<HAnchor tag="h2" title="Drawbacks of the derived store" />

<p>
	We want to <a href="https://shopify.dev/docs/api/storefront/2024-10/objects/Product#query-products" data-external>
		query a shopify endpoint
	</a>. The search and filter state should be stored in the url.
	<code class="break-all">?sort_by=latest-desc&availability=true&price.gte=10&price.lte=100&q=shirt</code> should be represented
	as:
</p>

<!-- shiki-start
```ts
{
	reverse: true,
	sortKey: 'CREATED_AT',
	availability: true,
	price: { min: 10, max: 100 },
	title: 'shirt'
}
 ```
 shiki-end -->

<p>
	In our previous implementation, the data is <code>derived</code> from <code>page</code>. This has a couple
	implications.
</p>

<ul>
	<li class="list-disc">
		<p>
			If there are invalid values in the url when the page first loads, we have to make a choice about whether the state
			of the store in the brief moment before our init function runs should be unclean or out of sync with
			<code>$page</code>. By making the state a <code>derived</code> store without a deserialize function, we implicitly
			chose that it should be unclean.
		</p>
	</li>

	<li class="list-disc">
		<p>The state's type is <code>string | null</code> or <code>string[]</code>.</p>
		<ul>
			<li class="list-decimal">
				We don't want to trap ourselves with JS type coercion by writing <code>if ($availability)</code> and always
				receiving <code>true</code> because <code>"false"</code> evaluates truthy. Booleans should be encoded as
				<code>boolean</code>.
			</li>
			<li class="list-decimal">
				We can't use any apis that require another type, so
				<a href="https://melt-ui.com/docs/builders/select" data-external> passing the store into melt-ui </a>, for
				example, is impossible.
			</li>
			<li class="list-decimal">
				Logically linked states have no clean way of being stored together. For example,
				<code>price.min {'>'} price.max</code> should be "unclean". In order to write this cleaning logic, a consumer
				would either have to serialize both states into one as <code>?price=10,100</code> and deserialize them in the
				inputs, or define them separately and wrap them in a function that controls their relationship and updates them
				with <code>.mutateSearchParams()</code> instead of <code>.set()</code>. That's messy, and shouldn't be the
				consumer's responsibility.
			</li>
		</ul>
	</li>

	<li class="list-disc">
		<p>
			Debouncing url changes becomes difficult because that requires debouncing the store update, overwriting user input
			that arrives faster than the debounce period. By not using <code>derived</code>, we can debounce and add effects
			that are invalidated when the url changes. For example, if there was a <code>load</code> function that referenced
			<code>url</code>, and the <code>searchParam</code> was on a number input, holding the up arrow would cause a massive
			number of load function invalidations. By decoupling the store from the URL state, we can immediately update the store
			and debounce the URL to ensure that the load function only runs when the user stops updating the params.
		</p>
	</li>
</ul>

<HAnchor tag="h2" title="Single Value Generic Param" />

<p>
	Like in the previous article, we'll start by deciding what we need and building up an interface, and like last time,
	we'll want two interfaces – one for single params and another for multiple. In the last implementation, single meant
	<code>string | null</code> and multiple meant <code>string[]</code> because they were tied to the
	<code>URLSearchParams</code> object. Now that we are free of that constraint, single will mean anything that a user will
	need a single input for, and multiple will mean anything that a user will need multiple inputs for. Let's again start with
	the simpler single param interface.
</p>

<HAnchor tag="h3" title="Building the Interface" />

<HAnchor tag="h4" title="Getters" />

<p>
	We know the base interface will definitely need to be generic over at least one type – our generic value type. That
	might be a <code>boolean</code> switch, a <code>string</code> query, a <code> &ge; 0 number</code> price, or anything
	else that will be presented to the user via a single input. Let's call that generic type <code>Val</code>.
</p>

<Admonition kind="note">
	We'll consider objects that will be presented to the user with multiple inputs – think
	<code>&lbrace; min, max &rbrace;</code> price – later.
</Admonition>

<CodeTopper title="paramGeneric.ts">
	<!-- shiki-start
```ts
interface ParamGeneric<Val> {
}
```
shiki-end -->
</CodeTopper>

<p>
	<code>type ParamVal = string | null</code>, so let's add a convenience function to get that value. It will also be
	nice to encode the name of the param into the type as a string literal, so let's add our a second generic param as
	well.
</p>

<CodeTopper title="paramGeneric.ts">
	<!-- shiki-start
```ts
type ParamVal = string | null;

interface ParamGeneric<Val, ParamName extends string> {//! d"diff-add" s", ParamName extends string"
	paramName: ParamName;//! d"diff-add"
	getParam: () => ParamVal;//! d"diff-add"
}
```
shiki-end -->
</CodeTopper>

<p>
	The validated source of truth will be in a Svelte store, so we'll add a <code>subscribe</code> function to get our store
	value.
</p>

<CodeTopper title="paramGeneric.ts">
	<!-- shiki-start
```ts
type ParamVal = string | null;

interface ParamGeneric<Val, ParamName extends string> {
	paramName: ParamName;
	getParam: () => ParamVal;
	subscribe: Readable<Val>['subscribe'];//! d"diff-add"
}
```
shiki-end -->
</CodeTopper>

<HAnchor tag="h4" title="Serializers" />

<p>
	Since we'll be working with both <code>Val</code> and <code>ParamVal</code>, we'll need serialize
	<code>Val => ParamVal</code> and deserialize <code>ParamVal => Val</code> functions to translate between them.
</p>

<CodeTopper title="paramGeneric.ts">
	<!-- shiki-start
```ts
type ParamVal = string | null;

interface ParamGeneric<Val, ParamName extends string> {
	paramName: ParamName;
	getParam: () => ParamVal;
	subscribe: Readable<Val>['subscribe'];
	serialize: (val: Val) => ParamVal;//! d"diff-add"
	deserialize: (paramVal: ParamVal) => Val;//! d"diff-add"
}
```
shiki-end -->
</CodeTopper>

<p>
	The serialize function won't need to think about validation logic. The store will be the source of truth and always
	contain a validated state. However, we must validate the input before it gets set into the store. We could add a
	<code>clean</code> function that we will call after we deserialize, and rename <code>deserialize</code> to
	<code>deserializeToUnclean</code> to make it clear that it's not a validation function. Then we'd sanitize param
	values by using <code>clean(deserializeToUnclean(paramVal))</code>. However, many times the <code>clean</code>
	function would be nearly identical to the <code>deserializeToUnclean</code> function and result in twice the function
	calls. Instead, we'll expect both a <code>clean</code> function and a separate <code>deserialize</code> function which
	validates. The consumer can then compose the validation logic however they want without risk of duplication.
</p>

<CodeTopper title="paramGeneric.ts">
	<!-- shiki-start
```ts
type ParamVal = string | null;

interface ParamGeneric<Val, ParamName extends string> {
	paramName: ParamName;
	getParam: () => ParamVal;
	subscribe: Readable<Val>['subscribe'];
	serialize: (cleanVal: Val) => ParamVal;
	deserialize: (uncleanParamVal: ParamVal) => Val;//! d"diff-add" s"uncleanParamVal"
	clean: (uncleanVal: Val) => Val;//! d"diff-add"
}
```
shiki-end -->
</CodeTopper>

<HAnchor tag="h4" title="Setters" />

<p>
	We'll need a way to mutate a URL to add/delete our param without navigating, so we'll add a <code>pushToUrl</code>
	function. Likewise, we'll need a way to pull the current <code>URLSearchParam</code> into our store:
	<code>pullFromUrl</code>.
</p>

<CodeTopper title="paramGeneric.ts">
	<!-- shiki-start
```ts
type ParamVal = string | null;

interface ParamGeneric<Val, ParamVal, StoreVal> {
	paramName: ParamName;
	getParam: () => ParamVal;
	subscribe: Readable<Val>['subscribe'];
	serialize: (cleanVal: Val) => ParamVal;
	deserialize: (uncleanParamVal: ParamVal) => Val;
	clean: (uncleanVal: Val) => Val;
	pushToUrl: (mutUrl: URL) => URL;//! d"diff-add"
	pullFromUrl: () => void;//! d"diff-add"
}
```
shiki-end -->
</CodeTopper>

<p>
	The <code>ParamVal</code> type <code>string | null</code> is useful for working with inputs, so let's add a
	<code>setParam</code> method that will call <code>deserialize</code>.
</p>
<p>
	If we already have a <code>Val</code>, we'll want to clean it before setting it. This will be the default option, so
	we'll call this method <code>set</code> and it will call <code>clean</code>. We might as well include a Svelte
	<code>update</code> method as well.
</p>

<p>
	If we know we already have a cleaned <code>Val</code>, we'll want to set it directly without having to run
	<code>clean</code> unnecessarily. We'll add a <code>setCleaned</code> method for that.
</p>

<p>
	In our simple implementation, we defined <code>type GoOpts = {'{'} absolute?: string {'}'}</code>. There was no way
	for us to update the store value without using <code>goto</code>, but that's no longer true. Therefore, let's change
	our <code>opts</code> parameter to use <code>MaybeGoOpts</code> which allow us to update the store without updating the
	url.
</p>

<CodeTopper title="paramGeneric.ts">
	<!-- shiki-start
```ts
type Changed = { changed: boolean };//! d"diff-add"
type GoOpts = { root?: string; deleteOtherParams?: true };//! d"diff-add"
type MaybeGoOpts = { nogo: true; root?: never; deleteOtherParams?: never } | ({ nogo?: never } & GoOpts);//! d"diff-add"

type ParamVal = string | null;

interface ParamGeneric<Val, ParamName extends string> {
	paramName: ParamName;
	getParam: () => ParamVal;
	subscribe: Readable<Val>['subscribe'];
	serialize: (cleanVal: Val) => ParamVal;
	deserialize: (uncleanParamVal: ParamVal) => Val;
	clean: (uncleanVal: Val) => Val;
	pushToUrl: (mutUrl: URL) => URL;
	pullFromUrl: () => void;
	setParam: (paramVal: ParamVal, opts?: MaybeGoOpts) => Changed;//! d"diff-add"
	set: (uncleanVal: Val, opts?: MaybeGoOpts) => Changed;//! d"diff-add"
	update: (cb: (old: Val) => Val) => void;//! d"diff-add"
	setCleaned: (cleaned: Val, opts?: MaybeGoOpts) => Changed;//! d"diff-add"
}
```
shiki-end -->
</CodeTopper>

<HAnchor tag="h4" title="Sync State" />

<p>
	Unlike the implementation using <code>derive</code>, the store and url may be out of sync. We should add an
	<code>isSynced</code> method to check that. Also, as we'll see later, it will be useful to know if the store is out of
	sync when it first initializes, so we'll add an <code>initiallyOutOfSync</code> property.
</p>

<CodeTopper title="paramGeneric.ts">
	<!-- shiki-start
```ts
type Changed = { changed: boolean };
type GoOpts = { root?: string; deleteOtherParams?: true };
type MaybeGoOpts = { nogo: true; root?: never; deleteOtherParams?: never } | ({ nogo?: never } & GoOpts);

type ParamVal = string | null;

interface ParamGeneric<Val, ParamName extends string> {
	paramName: ParamName;
	getParam: () => ParamVal;
	subscribe: Readable<Val>['subscribe'];
	serialize: (cleanVal: Val) => ParamVal;
	deserialize: (uncleanParamVal: ParamVal) => Val;
	clean: (uncleanVal: Val) => Val;
	pushToUrl: (mutUrl: URL) => URL;
	pullFromUrl: () => void;
	setParam: (paramVal: ParamVal, opts?: MaybeGoOpts) => Changed;
	set: (uncleanVal: Val, opts?: MaybeGoOpts) => Changed;
	update: (cb: (old: Val) => Val) => void;
	setCleaned: (cleaned: Val, opts?: MaybeGoOpts) => Changed;
	isSynced: (a?: { paramVal?: ParamVal; val?: Val }) => boolean;//! d"diff-add"
	initiallyOutOfSync: boolean;//! d"diff-add"
}
```
shiki-end -->
</CodeTopper>

<HAnchor tag="h3" title="Implementation" id="single-value-implementation" />

<p>We know what we have to do. Here's one way of getting there:</p>

<CodeTopper title={data.paramGeneric.title}>
	<TabPanelItem panel={data.paramGeneric} />
</CodeTopper>

<p>Pretty straightforward once the interface is decided.</p>

<ul>
	<li class="list-disc">
		<code>defaultValue</code> is the temporary value until the init function runs. This allows us to make sure the store
		is always validated.
	</li>
	<li class="list-disc">
		<code>skipInitGoto</code> can be useful if multiple params are on the same page and we want to wait for all of them to
		initialize before redirecting.
	</li>
	<li class="list-disc">
		We can update the store and URL separately, so we can now debounce <code>go</code> without ruining the user's input experience.
	</li>
</ul>

<HAnchor tag="h2" title="Multi Value Generic Param" />

<HAnchor tag="h3" title="Interface" />

<p>
	This is not synonymous with <code>$page.url.searchParams.getAll</code>. Instead, we will map out grouped params and
	assign them each a param name. For example, <code>{`{ foo: 'f', bar: 'b' }`}</code> will indicate the controller
	stores an object <code>{`{ foo: Val, bar: Val }`}</code> and the url params will be <code>f</code> and
	<code>b</code>.
</p>

<CodeTopper title="paramsGeneric.ts">
	<!-- shiki-start
```ts
interface ParamsGeneric<Val, ParamName extends string> {
	paramNameMap: Record<ParamName, string>;
	paramKeys: ParamName[];
}
```
shiki-end -->
</CodeTopper>

<p>
	The rest of our interface will be very similar to the single param interface. However, whereas before the store
	contained <code>Val</code>, it now contains <code>Record&lt;ParamName, Val&gt;</code>. Likewise, whereas before we
	accepted a <code>ParamVal</code>, we now accept a <code>Record&lt;ParamName, ParamVal&gt;</code>.
</p>

<CodeTopper title={data.paramsGenericInterface.title}>
	<TabPanelItem panel={data.paramsGenericInterface} />
</CodeTopper>

<HAnchor tag="h3" title="Implementation" id="multi-value-implementation" />

<p>And a possible implementation:</p>

<CodeTopper title={data.paramsGeneric.title}>
	<TabPanelItem panel={data.paramsGeneric} />
</CodeTopper>

<HAnchor tag="h2" title="Concrete Types" />

<p>Now that we have a generic factory, it's easy to create some concrete types:</p>

<TabPanels files={data.typedVariantFiles} />

<HAnchor tag="h2" title="Conclusion" />

<p>
	We've created a more flexible, generic implementation for our url state controller and now we can compose multiple
	together to create rich services like the one used in the demo. You can see it in action in the
	<a href="/shop/collections/apparel">demo shop</a>. Hope the article has been useful for you! Have any questions,
	comments, or want to share your own implementation? Reach out in the
	<a href="https://github.com/timothycohen/samplekit/discussions" data-external>GitHub discussions</a>!
</p>
