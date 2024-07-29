<script lang="ts">
	import { HAnchor } from '$lib/components';
	import I from '$lib/icons';

	let count = $state(0);
	// @ts-expect-error – Used in Markdown
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const increaseCount = () => count++;
</script>

<svelte:head>
	<title>Markdown Preprocessor | SampleKit</title>
</svelte:head>

<HAnchor tag="h1" title="Markdown" dataToc={null} />

<p>
	The <a data-external href="https://github.com/timothycohen/samplekit/tree/staging/packages/preprocess-markdown">
		<span class="font-mono text-base">@samplekit/preprocess-markdown</span>
	</a>
	npm package and
	<a data-external href="https://marketplace.visualstudio.com/items?itemName=timothycohen.svelte-pp-markdown">
		<span class="font-mono text-base">svelte-pp-markdown</span>
	</a>
	VS Code extension allow you to write Markdown processed with
	<a data-external href="https://github.com/markedjs/marked">Marked</a> directly within your Svelte template.
</p>

<HAnchor tag="h2" title="Feature Overview" />

<ul class="features">
	<li class="feature">
		<I.CircleCheckBig class="feature-icon" />
		<span class="feature-title">Write Markdown in Svelte templates.</span>
		<span class="feature-content">
			Write tables with ease just like you would with Markdown.
			<span class="code-table">
				<!-- md-start
| Preprocessor                   | VS Code Extension               |
| ------------------------------ | ------------------------------- |
| @samplekit/preprocess-katex    | timothycohen.svelte-pp-katex    |
| @samplekit/preprocess-markdown | timothycohen.svelte-pp-markdown |
| @samplekit/preprocess-shiki    | timothycohen.svelte-pp-shiki    |
md-end -->
			</span>
		</span>
	</li>

	<li class="feature">
		<I.CircleCheckBig class="feature-icon" />
		<span class="feature-title">Separate but Coexisting Languages</span>
		<span class="feature-content">
			Whereas other packages like <a data-external href="https://mdsvex.pngwn.io/docs"> mdsvex </a>
			freely mix Svelte and Markdown, this package isolates the preprocessing to blocks inside
			<code>md-start</code> and <code>md-end</code> tags. This lightweight approach preserves your control over the DOM
			and lets you break out into Markdown for those annoying parts of HTML (tables). There is a complementary
			preprocessor package which handles <a href="/docs/code-decoration">code block decoration</a> by using Shiki to inject
			CSS variables.
		</span>
	</li>

	<li class="feature">
		<I.CircleCheckBig class="feature-icon" />
		<span class="feature-title">Code with TextMate support.</span>
		<span class="feature-content">
			The <a
				data-external
				href="https://github.com/timothycohen/samplekit/tree/staging/packages/preprocess-markdown-vscode"
			>
				<span class="font-mono text-base">VS Code extension</span>
			</a> provides you with full highlighting support. It injects the TextMate grammar scope between the delimiters to work
			with your VS Code theme.
		</span>
	</li>
</ul>

<HAnchor tag="h2" title="Installation" />

<ol class="steps">
	<li class="step">
		<span class="step-title">Install the preprocessor</span>
		<span class="step-content">
			<span class="lg:text-lg">
				<!-- shiki-start
p c"no-lines"
```sh
pnpm add -D @samplekit/preprocess-markdown
```
shiki-end -->
			</span>
		</span>
	</li>

	<li class="step">
		<span class="step-title">Add to <code>svelte.config.js</code></span>
		<span class="step-content">
			<span class="lg:text-lg">
				<!-- shiki-start
d"diff-add" l"1" l"5-6" l"11-14"
```ts
import { processMarkdown, createMdLogger } from '@samplekit/preprocess-markdown';
import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const preprocessorRoot = `${import.meta.dirname}/src/routes/`;
const formatFilename = (/** @type {string} */ filename) => filename.replace(preprocessorRoot, '');

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: [
		processMarkdown({
			include: (filename) => filename.startsWith(preprocessorRoot),
			logger: createMdLogger(formatFilename),
		}),
		vitePreprocess(),
	],
	kit: {
		adapter: adapter(),
	},
};

export default config;
```
shiki-end -->
			</span>
		</span>
	</li>

	<li class="step">
		<span class="step-title">Install the VS Code extension (for snippets and syntax highlighting)</span>
		<span class="step-content">
			<a data-external href="https://marketplace.visualstudio.com/items?itemName=timothycohen.svelte-pp-markdown">
				timothycohen.svelte-pp-markdown
			</a>
		</span>
	</li>
</ol>

<HAnchor tag="h2" title="Example Usage" />

<div class="grid grid-cols-1 lg:grid-cols-2 lg:gap-4">
	<span>
		<p>Author with the highlighting extension:</p>
		<!-- shiki-start
t-md-block
```md
### A markdown table.

Style however you want.
Here's what it looks like with [Tailwind Typography](https://github.com/tailwindlabs/tailwindcss-typography).

| Heading 1 | Heading 2                |
| --------- | ------------------------ |
| cell 1    | count: {count}           |
| cell 3    | [cell 4](#example-usage) |

- [x] Markdown
- [x] Syntax Highlighting

### Reactivity

<button class="btn btn-accent" onclick={increaseCount}>Increase Count: {count}</button>
```
shiki-end -->
	</span>

	<div>
		<p>Author without the highlighting extension:</p>

		<!-- shiki-start
```md
&openhtmlcomment; md-start
### A markdown table.

Style however you want.
Here's what it looks like with [Tailwind Typography](https://github.com/tailwindlabs/tailwindcss-typography).

| Heading 1 | Heading 2                |
| --------- | ------------------------ |
| cell 1    | count: {count}           |
| cell 3    | [cell 4](#example-usage) |

- [x] Markdown
- [x] Syntax Highlighting

### Reactivity

<button class="btn btn-accent" onclick={increaseCount}>Increase Count: {count}</button>
md-end &closehtmlcomment;
```
shiki-end -->
	</div>
</div>

<div>
	<p>The transpiled HTML:</p>
	<!-- shiki-start
```html
<h3 id="a-markdown-table">A markdown table.</h3>
<p>
	Style however you want. Here's what it looks like with
	<a  data-external href="https://github.com/tailwindlabs/tailwindcss-typography">Tailwind Typography</a>.
</p>
<table>
	<thead>
		<tr>
			<th>Heading 1</th>
			<th>Heading 2</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td>cell 1</td>
			<td>count: {count}</td>
		</tr>
		<tr>
			<td>cell 3</td>
			<td>
				<a href="#example-usage">cell 4</a>
			</td>
		</tr>
	</tbody>
</table>
<ul>
	<li><input checked="" disabled="" type="checkbox" /> Markdown</li>
	<li><input checked="" disabled="" type="checkbox" /> Syntax Highlighting</li>
</ul>
<h3 id="reactivity">Reactivity</h3>
<p><button class="btn btn-accent" onclick={increaseCount}>Increase Count: {count}</button></p>
```
shiki-end -->
</div>

<p>After preprocessing:</p>

<div>
	<!-- md-start
### A markdown table.

Style however you want.
Here's what it looks like with [Tailwind Typography](https://github.com/tailwindlabs/tailwindcss-typography).

| Heading 1 | Heading 2                |
| --------- | ------------------------ |
| cell 1    | count: {count}           |
| cell 3    | [cell 4](#example-usage) |

- [x] Markdown
- [x] Syntax Highlighting

### Reactivity

<button class="btn btn-accent" onclick={increaseCount}>Increase Count: {count}</button>

md-end -->
</div>

<HAnchor tag="h2" title="Scope" />

<div class="p">
	<a data-external href="https://github.com/markedjs/marked">Marked</a>, the package this preprocessor wraps, is a
	Markdown to HTML parser. As in the example above, it's possible to use Svelte mustache tags. However, there's no
	effort to handle Svelte syntax. Things like <!-- shiki-svelte <button onclick={() => { count++ }}> shiki-svelte -->
	won't work. These preprocessor packages are intended for authors who prefer Svelte / HTML and only want to escape into
	Markdown for short sprints. If you're looking to spend most of your time in Markdown, check out
	<a data-external href="https://mdsvex.pngwn.io/docs">MDsveX</a>.
</div>

<style lang="postcss">
	.code-table :global(td) {
		@apply font-mono;
	}
</style>
