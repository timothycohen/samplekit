<script>
	import { HAnchor } from '$lib/components';

	let count = $state(0);
	// @ts-expect-error – Used in Markdown
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const increaseCount = () => count++;
</script>

<h1>Markdown</h1>

<p>
	The <a href="https://github.com/timothycohen/samplekit/tree/staging/packages/preprocess-markdown">
		<code>@samplekit/preprocess-markdown</code>
	</a>
	package and
	<a href="https://github.com/timothycohen/samplekit/tree/staging/packages/preprocess-markdown-vscode">
		<code>@samplekit/preprocess-markdown-vscode</code>
	</a>
	extension allow you to use Markdown processed with directly within your Svelte template.
</p>

<HAnchor tag="h2" title="Feature Overview" />

<p class="text-gray-12">Write Markdown in your Svelte!</p>

<p>
	This preprocessor allows you to write Markdown blocks directly in Svelte templates. Whereas other packages like
	<a href="https://mdsvex.pngwn.io/docs"> mdsvex </a> freely mix Svelte and Markdown, this package isolates the
	preprocessing to blocks inside <!-- shiki-ts md-start shiki-ts --> and <!-- shiki-ts md-end shiki-ts --> tags. This lightweight
	approach preserves your control over the DOM and lets you break out into Markdown for those annoying parts of HTML (tables).
	There is a complementary preprocessor package which handles <a href="/docs/codeblocks">codeblock highlighting</a> using
	injected css variables via shiki.
</p>

<HAnchor tag="h2" title="Installation" />

<ol>
	<li>Install the preprocessor</li>
	<div class="no-lines">
		<!-- shiki-start
```sh
pnpm add -D @samplekit/preprocess-markdown
```
shiki-end -->
	</div>
	<li>Add to <!-- shiki-ts svelte.config.js shiki-ts --></li>
	<!-- shiki-start
```ts
import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { processMarkdown } from '@samplekit/preprocess-markdown'; // [!diff-add]

const preprocessorRoot = `${import.meta.dirname}/src/routes/`; // [!diff-add]

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: [
		processMarkdown({ include: (filename) => filename.startsWith(preprocessorRoot) }),  // [!diff-add]
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
	<a href="https://marketplace.visualstudio.com/items?itemName=svelte.svelte-markdown-vscode">
		timothycohen.svelte-markdown-vscode
	</a>
</ol>

<HAnchor tag="h2" title="Example Usage" />

<div class="grid gap-4 lg:grid-cols-2">
	<div>
		<p>Author with the highlighting extension:</p>

		<!-- prettier-ignore -->
		<div class="code-wrapper"><pre style="--h-darker:#D4D4D4;--h-rose-pine-dawn:#575279;--h-darker-bg:#000;--h-rose-pine-dawn-bg:#faf4ed"><code><span data-line="1"><span style="--h-darker:#6A9955;--h-rose-pine-dawn:#797593;--h-darker-font-style:italic;--h-rose-pine-dawn-font-style:italic">&lt;!--</span><span style="--h-darker:#6A9955;--h-rose-pine-dawn:#9893A5;--h-darker-font-style:italic;--h-rose-pine-dawn-font-style:italic"> md-start</span></span>
<span data-line="2"><span style="--h-darker:#569CD6;--h-rose-pine-dawn:#797593;--h-darker-font-weight:bold;--h-rose-pine-dawn-font-weight:bold">###</span><span style="--h-darker:#569CD6;--h-rose-pine-dawn:#56949F;--h-darker-font-weight:bold;--h-rose-pine-dawn-font-weight:bold"> A markdown table.</span></span>
<span data-line="3"></span>
<span data-line="4"><span style="--h-darker:#D4D4D4;--h-rose-pine-dawn:#575279">Style however you want.</span></span>
<span data-line="5"><span style="--h-darker:#D4D4D4;--h-rose-pine-dawn:#575279">Here's what it looks like with </span><span style="--h-darker:#D4D4D4;--h-rose-pine-dawn:#797593">[</span><span style="--h-darker:#CE9178;--h-rose-pine-dawn:#EA9D34">Tailwind Typography</span><span style="--h-darker:#D4D4D4;--h-rose-pine-dawn:#797593">](</span><span style="--h-darker:#D4D4D4;--h-rose-pine-dawn:#575279;--h-darker-text-decoration:underline;--h-rose-pine-dawn-text-decoration:inherit">https://github.com/tailwindlabs/tailwindcss-typography</span><span style="--h-darker:#D4D4D4;--h-rose-pine-dawn:#797593">)</span><span style="--h-darker:#D4D4D4;--h-rose-pine-dawn:#575279">.</span></span>
<span data-line="6"></span>
<span data-line="7"><span style="--h-darker:#D4D4D4;--h-rose-pine-dawn:#797593">|</span><span style="--h-darker:#D4D4D4;--h-rose-pine-dawn:#575279"> Heading 1 </span><span style="--h-darker:#D4D4D4;--h-rose-pine-dawn:#797593">|</span><span style="--h-darker:#D4D4D4;--h-rose-pine-dawn:#575279"> Heading 2         </span><span style="--h-darker:#D4D4D4;--h-rose-pine-dawn:#797593">|</span></span>
<span data-line="8"><span style="--h-darker:#D4D4D4;--h-rose-pine-dawn:#797593">|</span><span style="--h-darker:#D4D4D4;--h-rose-pine-dawn:#797593"> ---------</span><span style="--h-darker:#D4D4D4;--h-rose-pine-dawn:#797593"> |</span><span style="--h-darker:#D4D4D4;--h-rose-pine-dawn:#797593"> -----------------</span><span style="--h-darker:#D4D4D4;--h-rose-pine-dawn:#797593"> |</span></span>
<span data-line="9"><span style="--h-darker:#D4D4D4;--h-rose-pine-dawn:#797593">|</span><span style="--h-darker:#D4D4D4;--h-rose-pine-dawn:#575279"> cell 1    </span><span style="--h-darker:#D4D4D4;--h-rose-pine-dawn:#797593">|</span><span style="--h-darker:#D4D4D4;--h-rose-pine-dawn:#575279"> cell 2            </span><span style="--h-darker:#D4D4D4;--h-rose-pine-dawn:#797593">|</span></span>
<span data-line="10"><span style="--h-darker:#D4D4D4;--h-rose-pine-dawn:#797593">|</span><span style="--h-darker:#D4D4D4;--h-rose-pine-dawn:#575279"> cell 3    </span><span style="--h-darker:#D4D4D4;--h-rose-pine-dawn:#797593">|</span><span style="--h-darker:#D4D4D4;--h-rose-pine-dawn:#797593"> [</span><span style="--h-darker:#CE9178;--h-rose-pine-dawn:#EA9D34">cell 4</span><span style="--h-darker:#D4D4D4;--h-rose-pine-dawn:#797593">](</span><span style="--h-darker:#D4D4D4;--h-rose-pine-dawn:#575279;--h-darker-text-decoration:underline;--h-rose-pine-dawn-text-decoration:inherit">/cell-4</span><span style="--h-darker:#D4D4D4;--h-rose-pine-dawn:#797593">)</span><span style="--h-darker:#D4D4D4;--h-rose-pine-dawn:#797593"> |</span></span>
<span data-line="11"></span>
<span data-line="12"><span style="--h-darker:#6796E6;--h-rose-pine-dawn:#797593">-</span><span style="--h-darker:#D4D4D4;--h-rose-pine-dawn:#797593"> [</span><span style="--h-darker:#CE9178;--h-rose-pine-dawn:#EA9D34">x</span><span style="--h-darker:#D4D4D4;--h-rose-pine-dawn:#797593">]</span><span style="--h-darker:#D4D4D4;--h-rose-pine-dawn:#575279"> Markdown</span></span>
<span data-line="13"><span style="--h-darker:#6796E6;--h-rose-pine-dawn:#797593">-</span><span style="--h-darker:#D4D4D4;--h-rose-pine-dawn:#797593"> [</span><span style="--h-darker:#CE9178;--h-rose-pine-dawn:#EA9D34">x</span><span style="--h-darker:#D4D4D4;--h-rose-pine-dawn:#797593">]</span><span style="--h-darker:#D4D4D4;--h-rose-pine-dawn:#575279"> Syntax Highlighting</span></span>
<span data-line="14"></span>
<span data-line="15"><span style="--h-darker:#569CD6;--h-rose-pine-dawn:#797593;--h-darker-font-weight:bold;--h-rose-pine-dawn-font-weight:bold">###</span><span style="--h-darker:#569CD6;--h-rose-pine-dawn:#56949F;--h-darker-font-weight:bold;--h-rose-pine-dawn-font-weight:bold"> Reactivity</span></span>
<span data-line="16"></span>
<span data-line="17"><span style="--h-darker:#808080;--h-rose-pine-dawn:#9893A5">&lt;</span><span style="--h-darker:#569CD6;--h-rose-pine-dawn:#56949F">button</span><span style="--h-darker:#9CDCFE;--h-rose-pine-dawn:#907AA9;--h-darker-font-style:italic;--h-rose-pine-dawn-font-style:italic"> class</span><span style="--h-darker:#D4D4D4;--h-rose-pine-dawn:#797593">=</span><span style="--h-darker:#CE9178;--h-rose-pine-dawn:#EA9D34">"btn btn-accent"</span><span style="--h-darker:#9CDCFE;--h-rose-pine-dawn:#907AA9;--h-darker-font-style:italic;--h-rose-pine-dawn-font-style:italic"> onclick</span><span style="--h-darker:#D4D4D4;--h-rose-pine-dawn:#797593">=</span><span style="--h-darker:#569CD6;--h-rose-pine-dawn:#797593">&#123;</span><span style="--h-darker:#9CDCFE;--h-rose-pine-dawn:#575279;--h-darker-font-style:inherit;--h-rose-pine-dawn-font-style:italic">increaseCount</span><span style="--h-darker:#569CD6;--h-rose-pine-dawn:#797593">&#125;</span><span style="--h-darker:#808080;--h-rose-pine-dawn:#9893A5">&gt;</span><span style="--h-darker:#D4D4D4;--h-rose-pine-dawn:#575279">Increase Count: </span><span style="--h-darker:#569CD6;--h-rose-pine-dawn:#797593">&#123;</span><span style="--h-darker:#9CDCFE;--h-rose-pine-dawn:#575279;--h-darker-font-style:inherit;--h-rose-pine-dawn-font-style:italic">count</span><span style="--h-darker:#569CD6;--h-rose-pine-dawn:#797593">&#125;</span><span style="--h-darker:#808080;--h-rose-pine-dawn:#9893A5">&lt;/</span><span style="--h-darker:#569CD6;--h-rose-pine-dawn:#56949F">button</span><span style="--h-darker:#808080;--h-rose-pine-dawn:#9893A5">&gt;</span></span>
<span data-line="18"><span style="--h-darker:#6A9955;--h-rose-pine-dawn:#9893A5;--h-darker-font-style:italic;--h-rose-pine-dawn-font-style:italic">md-end </span><span style="--h-darker:#6A9955;--h-rose-pine-dawn:#797593;--h-darker-font-style:italic;--h-rose-pine-dawn-font-style:italic">--&gt;</span></span></code></pre></div>
	</div>

	<div>
		<p>Author without the highlighting extension:</p>

		<!-- shiki-start
```md
&openhtmlcomment; md-start
### A markdown table.

Style however you want.
Here's what it looks like with [Tailwind Typography](https://github.com/tailwindlabs/tailwindcss-typography).

| Heading 1 | Heading 2         |
| --------- | ----------------- |
| cell 1    | cell 2            |
| cell 3    | [cell 4](/cell-4) |

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
	<p>The preprocessor transpiles to HTML:</p>
	<!-- shiki-start
```html
<h3>A markdown table.</h3>
<p>
	Style however you want. Here's what it looks like with
	<a href="https://github.com/tailwindlabs/tailwindcss-typography">Tailwind Typography</a>.
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
			<td>cell 2</td>
		</tr>
		<tr>
			<td>cell 3</td>
			<td>
				<a href="/cell-4">cell 4</a>
			</td>
		</tr>
	</tbody>
</table>
<ul>
	<li><input checked="" disabled="" type="checkbox" /> Markdown</li>
	<li><input checked="" disabled="" type="checkbox" /> Syntax Highlighting</li>
</ul>
<h3>Reactivity</h3>
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

| Heading 1 | Heading 2         |
| --------- | ----------------- |
| cell 1    | cell 2            |
| cell 3    | [cell 4](/cell-4) |

- [x] Markdown
- [x] Syntax Highlighting

### Reactivity

<button class="btn btn-accent" onclick={increaseCount}>Increase Count: {count}</button>

md-end -->
</div>

<HAnchor tag="h2" title="Scope Hints" />

<p>
	Marked, the package this preprocessor wraps, is a Markdown to HTML parser. There's no guarantee, or even effort, to
	handle Svelte syntax. The only two things the author of this package finds easier to write in Markdown than HTML are
	tables and highlighted codeblocks. This package is perfect for the former. If you're looking for the latter, see
	<a href="/docs/codeblocks">codeblock highlighting</a>. If you're looking for a full Svelte in Markdown experience,
	<a href="https://mdsvex.pngwn.io/docs"> mdsvex </a> may be a better fit.
</p>
