<script lang="ts">
	import { mdLanguages } from '@samplekit/preprocess-shiki';
	import { HAnchor, Delimiter } from '$lib/components';
	import ProcessedExample from '$lib/generated/codeblockProcessedExample.svelte';
	import WriteExample from '$lib/generated/codeblockWriteExample.svelte';
</script>

<h1>Codeblocks</h1>

<p>
	The <a href="https://github.com/timothycohen/samplekit/tree/staging/packages/preprocess-shiki">
		<code>@samplekit/preprocess-shiki</code>
	</a>
	package and
	<a href="https://github.com/timothycohen/samplekit/tree/staging/packages/preprocess-shiki-vscode">
		<code>@samplekit/preprocess-shiki-vscode</code>
	</a>
	extension allow you to write codeblocks to be highlighted by <a href="https://shiki.style/">shiki</a> directly within your
	Svelte template.
</p>

<HAnchor tag="h2" title="Feature Overview" />

<p class="text-gray-12">Write highlighted codeblocks in your Svelte!</p>

<p>
	This preprocessor allows you to write fenced or inline codeblocks in Svelte templates. Whereas other packages like
	<a href="https://mdsvex.pngwn.io/docs"> mdsvex </a> freely mix Svelte and Markdown, this package isolates the
	preprocessing to blocks inside <!-- shiki-ts shiki-start shiki-ts --> and <!-- shiki-ts shiki-end shiki-ts --> tags. This
	lightweight approach preserves your control over the DOM and lets you break out into fenced codeblocks as needed. There
	is a complementary preprocessor package which handles <a href="/docs/markdown">generic markdown</a> using marked.
</p>

<HAnchor tag="h2" title="Installation" />

<ol>
	<li>Install the preprocessor</li>
	<div class="no-lines">
		<!-- shiki-start
	```sh
	pnpm add -D @samplekit/preprocess-shiki
	```
	shiki-end -->
	</div>
	<li>Add to <!-- shiki-ts svelte.config.js shiki-ts --></li>
	<!-- shiki-start
```ts
import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { processCodeblock } from '@samplekit/preprocess-shiki'; // [!diff-add]

const preprocessorRoot = `${import.meta.dirname}/src/routes/`; // [!diff-add]

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: [
		processCodeblock({ include: (filename) => filename.startsWith(preprocessorRoot) }),  // [!diff-add]
		vitePreprocess(),
	],
	kit: {
		adapter: adapter(),
	},
};

export default config;
```
shiki-end -->
	<li>Install the VS Code extension (for snippets and syntax highlighting)</li>
	<a href="https://marketplace.visualstudio.com/items?itemName=svelte.svelte-shiki-vscode">
		timothycohen.svelte-shiki-vscode
	</a>
</ol>

<HAnchor tag="h2" title="Example Usage" />

<p>
	The default supported languages are <code>{mdLanguages.join(', ')}</code>. They can be used with code fences or
	inline. You can also pass your own shiki <code>Highlighter</code> instance to the preprocessor if you'd like to use different
	languages.
</p>

<HAnchor tag="h3" title="Inline Code" />

<div class="code-wrapper">
	<pre style="--h-darker:#D4D4D4;--h-rose-pine-dawn:#575279;--h-darker-bg:#000;--h-rose-pine-dawn-bg:#faf4ed"><code
			><span data-line="1"
				><Delimiter name="shiki-ts" mode="start" /> <span
					style="--h-darker:#569CD6;--h-rose-pine-dawn:#286983;--h-darker-font-style:italic;--h-rose-pine-dawn-font-style:inherit"
					>const</span
				><span
					style="--h-darker:#4FC1FF;--h-rose-pine-dawn:#575279;--h-darker-font-style:inherit;--h-rose-pine-dawn-font-style:italic"> foo</span
				><span style="--h-darker:#D4D4D4;--h-rose-pine-dawn:#286983"> =</span><span
					style="--h-darker:#CE9178;--h-rose-pine-dawn:#EA9D34"> "bar"</span
				><span style="--h-darker:#D4D4D4;--h-rose-pine-dawn:#797593">;</span> <Delimiter
					name="shiki-ts"
					mode="end"
				/></span
			></code
		></pre>
</div>

<HAnchor tag="h3" title="Fenced Code" />

<div class="grid gap-4 lg:grid-cols-2">
	<div>
		<p>Author with the highlighting extension:</p>

		<WriteExample />
	</div>

	<div>
		<p>Author without the highlighting extension:</p>
		<!-- shiki-start
~~~md
&openhtmlcomment; shiki-start
```ts
&tripslash;highlight:2
console.log('hello world');
const highlightedLine = true;
```
shiki-end &closehtmlcomment;
~~~
shiki-end -->
	</div>
</div>

<p>
	The preprocessor transpiles the code to HTML and injects styles that you can target with CSS. This example uses the
	two default themes: <a href="https://github.com/timothycohen/darker-theme"><code>Darker</code></a> and
	<a href="https://marketplace.visualstudio.com/items?itemName=mvllow.rose-pine"><code>Rosé Pine Dawn</code></a>.
</p>

<ProcessedExample />

<p>Rendered with CSS:</p>
<!-- shiki-start
```ts
///highlight:2
console.log('hello world');
const highlightedLine = true;
```
shiki-end -->

<HAnchor tag="h4" title="Options" />

<p>There are four highlighting features, each of which can be used with global or per-line syntax.</p>

<!-- md-start
| Inline         | Global                 |
| -------------- | ---------------------- |
[!highlight]     | ///highlight 1-7,5   | |
[!hide]          | ///hide 3-7,5        | |
[!diff-add]      | ///diff-add 3-7,5    | |
[!diff-remove]   | ///diff-remove 3-7,5 | |
md-end -->

<p>Example using all options:</p>

<!-- shiki-start
```md
&tripgrave;ts
&tripslash;highlight:1-3, 6
&tripslash;diff-add:9-11
&tripslash;diff-remove:13-15
&tripslash;hide:17-19
const highlightedBlock = () => {
	// highlighted
}

{
	const alsoHighlighted = true;
}

{
	const isDiffAdded = true;
}

{
	const isDiffRemoved = true;
}

{
	const isHidden = true;
}

const nothingSpecial = () => console.log('hello world');

const hiddenLine = '!' // &brackbang;hide]
const singleHighlightedLine = true; // &brackbang;highlight]
const deprecation = true; // &brackbang;diff-remove]
const coolNewFeature = () => 'bazinga'; // &brackbang;diff-add]
&tripgrave;
```
shiki-end -->

<p>The processed example:</p>

<!-- shiki-start
```ts
///highlight:1-3, 6
///diff-add:9-11
///diff-remove:13-15
///hide:17-19
const highlightedBlock = () => {
	// highlighted
}

{
	const alsoHighlighted = true;
}

{
	const isDiffAdded = true;
}

{
	const isDiffRemoved = true;
}

{
	const isHidden = true;
}

const nothingSpecial = () => console.log('hello world');

const hiddenLine = '!' // [!hide]
const singleHighlightedLine = true; // [!highlight]
const deprecation = true; // [!diff-remove]
const coolNewFeature = () => 'bazinga'; // [!diff-add]
```
shiki-end -->

<div class="not-prose alert-wrapper alert-wrapper-info text-base">
	<p class="alert-header my-0">Hint</p>
	<p class="my-2">
		Hide is useful when you want to show only part of a larger object, like a method on a class. Writing the surrounding
		code and hiding it allows shiki to process it correctly.
	</p>
</div>

<HAnchor tag="h2" title="Whitespace Hints" />

<HAnchor tag="h3" title="Fenced" />

<p>
	The <code>pre</code> tag added by the codefence preserves whitespace, so don't indent your code tags unnecessarily.
</p>

<p>Wrong ❌</p>
<!-- shiki-start
~~~md
```ts
		const firstMargin = 'trimmed';
		const nextLine = 'preserves whitespace';
```
~~~
shiki-end -->

<p>Unwanted indentation:</p>

<!-- shiki-start
```ts
		const firstMargin = 'trimmed';
		const nextLine = 'preserves whitespace';
```
shiki-end -->

<p>Correct ✔️</p>

<!-- shiki-start
~~~md
```ts
const firstMargin = 'trimmed by preprocessor';
const nextLine = 'preserves whitespace';
```
~~~
shiki-end -->

<p>No extra whitespace:</p>

<!-- shiki-start
```ts
const firstMargin = 'trimmed';
const nextLine = 'preserves whitespace';
```
shiki-end -->

<HAnchor tag="h3" title="Inline" />

<p>
	When writing inline code, Svelte <a href="https://github.com/sveltejs/svelte/issues/12140"> doesn't respect </a>
	<code>whitespace: pre</code> style. All whitespace will be collapsed like so: <!-- shiki-ts const foo = "bar"; shiki-ts -->
</p>

<p>To get around this, you have three options:</p>
<ol>
	<li>
		Add <code>preserveWhitespace</code> to the component.
		<div class="no-lines">
			<!-- shiki-start
				```svelte
				<svelte:options preserveWhitespace={true} />
				```
				shiki-end -->
		</div>
	</li>

	<li>
		Add <code>preserveWhitespace</code> to the <code>svelte.config.js</code> compiler options.
		<div class="no-lines">
			<!-- shiki-start
```js
/** @type {import('@sveltejs/kit').Config} */
const config = {
	compilerOptions: {
		preserveWhitespace: true,
	},
	...
};

export default config;
```
shiki-end -->
		</div>
	</li>

	<li>
		Manually wrap your code in a pre. Note that this option is not available when nested within some other tags, like
		<code>p</code>.
		<div class="no-lines">
			<div class="code-wrapper">
				<pre
					style="--h-darker:#D4D4D4;--h-rose-pine-dawn:#575279;--h-darker-bg:#000;--h-rose-pine-dawn-bg:#faf4ed"><code
						><span data-line="1"
							><span style="--h-darker:#808080;--h-rose-pine-dawn:#9893A5">&lt;</span><span
								style="--h-darker:#569CD6;--h-rose-pine-dawn:#56949F">pre</span
							><span style="--h-darker:#808080;--h-rose-pine-dawn:#9893A5">&gt;</span><Delimiter
								name="shiki-ts"
								mode="start"
							/> <span
								style="--h-darker:#569CD6;--h-rose-pine-dawn:#286983;--h-darker-font-style:italic;--h-rose-pine-dawn-font-style:inherit"
								>const</span
							><span
								style="--h-darker:#4FC1FF;--h-rose-pine-dawn:#575279;--h-darker-font-style:inherit;--h-rose-pine-dawn-font-style:italic"> foo</span
							><span style="--h-darker:#D4D4D4;--h-rose-pine-dawn:#286983"> =</span><span
								style="--h-darker:#CE9178;--h-rose-pine-dawn:#EA9D34"> "bar"</span
							><span style="--h-darker:#D4D4D4;--h-rose-pine-dawn:#797593">;</span> <Delimiter
								name="shiki-ts"
								mode="end"
							/><span style="--h-darker:#808080;--h-rose-pine-dawn:#9893A5">&lt;/</span><span
								style="--h-darker:#569CD6;--h-rose-pine-dawn:#56949F">pre</span
							><span style="--h-darker:#808080;--h-rose-pine-dawn:#9893A5">&gt;</span></span
						></code
					></pre>
			</div>
		</div>
	</li>
</ol>
