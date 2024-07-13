<script lang="ts">
	import { HAnchor } from '$lib/components';
	import { Display, LaTeX } from '$lib/math';

	const eq1 = LaTeX`
		x = {-b \pm \sqrt{b^2-4ac} \over 2a}
	`;

	let r = $state(1);
	const A = $derived((Math.PI * r ** 2).toFixed(2));

	const eq = $derived(`\\begin{align}
r &= ${r} \\\\
r^2 &= ${r ** 2} \\\\
A = \\pi r^2 &= ${A} \\\\
\\end{align}`);
</script>

<h1>Math</h1>

<p>
	The <a href="https://github.com/timothycohen/samplekit/tree/staging/packages/preprocess-katex">
		<code>@samplekit/preprocess-katex</code>
	</a>
	package and
	<a href="https://github.com/timothycohen/samplekit/tree/staging/packages/preprocess-katex-vscode">
		<code>@samplekit/preprocess-katex-vscode</code>
	</a>
	extension allow you to use <a href="https://katex.org/docs/supported.html">KaTeX</a> directly within your Svelte template.
</p>

<HAnchor tag="h2" title="Feature Overview" />

<ol>
	<li class="text-lg">
		<span class="text-gray-12">Write beautiful math in Svelte templates.</span>
		<span class="block text-base">
			This is done using <a href="https://katex.org/docs/supported.html">KaTeX</a>, a package that supports a subset of
			TeX macros and some higher order LaTeX macros found in packages like amssymb. If you're not familiar with TeX,
			it's a typesetting system commonly used in STEM fields. It lets you easily write math: <!-- \( x = \frac{-b\ \pm\ \sqrt{b^2 - 4ac}}{2a} \) -->
		</span>
	</li>
	<li class="text-lg">
		<span class="text-gray-12">Eliminate flashes of unstyled content.</span>
		<span class="block text-base">
			By using a preprocessor directly on the server, delays and flashes of unstyled content are avoided. The page can
			also be statically generated if desired.
		</span>
	</li>
	<li class="text-lg">
		<span class="text-gray-12">Work with existing tooling.</span>
		<span class="block text-base">
			No need to invent a new file extension or disable other tools. By using regular HTML comments in
			<code>.svelte</code> files we ensure that Prettier, ESLint, <code>svelte-check</code>,
			<code>svelte.svelte-vscode</code>, etc. leave our code alone. The code is processed into something Svelte
			understands, but if the preprocessor isn't installed yet, nothing breaks – the code simply turns into an HTML
			comment.
		</span>
	</li>
	<li class="text-lg">
		<span class="text-gray-12">Code with TextMate support.</span>
		<span class="block text-base">
			The VS Code extension provides you with full highlighting support. It injects the LaTeX grammar scope between the
			delimiters to work with your preferred theme.
		</span>
	</li>
</ol>

<HAnchor tag="h2" title="Installation" />

<ol>
	<li>Install the preprocessor</li>
	<div class="no-lines">
		<!-- shiki-start
	```sh
	pnpm add -D @samplekit/preprocess-katex
	```
	shiki-end -->
	</div>
	<li>Add to <!-- shiki-ts svelte.config.js shiki-ts --></li>
	<!-- shiki-start
```ts
import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { processKatex } from '@samplekit/preprocess-katex'; // [!diff-add]

const preprocessorRoot = `${import.meta.dirname}/src/routes/`; // [!diff-add]

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: [
		processKatex({ include: (filename) => filename.startsWith(preprocessorRoot) }),  // [!diff-add]
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
	<a href="https://marketplace.visualstudio.com/items?itemName=svelte.svelte-katex-vscode">
		timothycohen.svelte-katex-vscode
	</a>
</ol>

<HAnchor tag="h2" title="Example Usage" />
<p>There are four wrappers around math:</p>
<ol>
	<li>
		Display math in Svelte templates: <pre
			class="inline"><!-- shiki-md &openhtmlcomment; \[ ... \] &closehtmlcomment; shiki-md --></pre>
	</li>
	<li>
		Inline math in Svelte templates: <pre
			class="inline"><!-- shiki-md &openhtmlcomment; \( ... \) &closehtmlcomment; shiki-md --></pre>
	</li>
	<li>
		Display math via JavaScript: <pre class="inline"><!-- shiki-ts const eq = LaTeX`...`; shiki-ts --></pre>
	</li>
	<li>
		Inline math via JavaScript:
		<pre class="inline"><!-- shiki-ts const eq = LaTeX`...`; shiki-ts --></pre>
	</li>
</ol>

<HAnchor tag="h3" title="Svelte Template" />

<HAnchor tag="h4" title="Display" />
<div class="grid gap-4 lg:grid-cols-2">
	<div>
		<p>Author with the highlighting extension:</p>
		<!-- prettier-ignore -->
		<div class="code-wrapper"><pre style="--h-darker:#D4D4D4;--h-rose-pine-dawn:#575279;--h-darker-bg:#000;--h-rose-pine-dawn-bg:#faf4ed"><code><span data-line="1"><span style="--h-darker:#6A9955;--h-rose-pine-dawn:#797593;--h-darker-font-style:italic;--h-rose-pine-dawn-font-style:italic">&lt;!--</span><span style="--h-darker:#6A9955;--h-rose-pine-dawn:#9893A5;--h-darker-font-style:italic;--h-rose-pine-dawn-font-style:italic"> \[</span></span>
<span data-line="2"><span style="--h-darker:#DCDCAA;--h-rose-pine-dawn:#797593;--h-darker-font-style:inherit;--h-rose-pine-dawn-font-style:italic">\</span><span style="--h-darker:#DCDCAA;--h-rose-pine-dawn:#B4637A;--h-darker-font-style:inherit;--h-rose-pine-dawn-font-style:italic">begin</span><span style="--h-darker:#D4D4D4;--h-rose-pine-dawn:#797593">&lbrace;</span><span style="--h-darker:#9CDCFE;--h-rose-pine-dawn:#907AA9;--h-darker-font-style:inherit;--h-rose-pine-dawn-font-style:italic">align</span><span style="--h-darker:#D4D4D4;--h-rose-pine-dawn:#797593">&rbrace;</span></span>
<span data-line="3"><span style="--h-darker:#4EC9B0;--h-rose-pine-dawn:#797593">\</span><span style="--h-darker:#4EC9B0;--h-rose-pine-dawn:#286983">dot</span><span style="--h-darker:#4EC9B0;--h-rose-pine-dawn:#797593">&lbrace;</span><span style="--h-darker:#4EC9B0;--h-rose-pine-dawn:#56949F">x</span><span style="--h-darker:#4EC9B0;--h-rose-pine-dawn:#797593">&rbrace;</span><span style="--h-darker:#C586C0;--h-rose-pine-dawn:#286983;--h-darker-font-style:italic;--h-rose-pine-dawn-font-style:inherit"> &#x26;</span><span style="--h-darker:#4EC9B0;--h-rose-pine-dawn:#56949F"> = </span><span style="--h-darker:#569CD6;--h-rose-pine-dawn:#797593">\</span><span style="--h-darker:#569CD6;--h-rose-pine-dawn:#286983">sigma</span><span style="--h-darker:#4EC9B0;--h-rose-pine-dawn:#797593">(</span><span style="--h-darker:#4EC9B0;--h-rose-pine-dawn:#56949F">y</span><span style="--h-darker:#4EC9B0;--h-rose-pine-dawn:#797593">-</span><span style="--h-darker:#4EC9B0;--h-rose-pine-dawn:#56949F">x</span><span style="--h-darker:#4EC9B0;--h-rose-pine-dawn:#797593">)</span><span style="--h-darker:#C586C0;--h-rose-pine-dawn:#286983;--h-darker-font-style:italic;--h-rose-pine-dawn-font-style:inherit"> \\</span></span>
<span data-line="4"><span style="--h-darker:#4EC9B0;--h-rose-pine-dawn:#797593">\</span><span style="--h-darker:#4EC9B0;--h-rose-pine-dawn:#286983">dot</span><span style="--h-darker:#4EC9B0;--h-rose-pine-dawn:#797593">&lbrace;</span><span style="--h-darker:#4EC9B0;--h-rose-pine-dawn:#56949F">y</span><span style="--h-darker:#4EC9B0;--h-rose-pine-dawn:#797593">&rbrace;</span><span style="--h-darker:#C586C0;--h-rose-pine-dawn:#286983;--h-darker-font-style:italic;--h-rose-pine-dawn-font-style:inherit"> &#x26;</span><span style="--h-darker:#4EC9B0;--h-rose-pine-dawn:#56949F"> = </span><span style="--h-darker:#569CD6;--h-rose-pine-dawn:#797593">\</span><span style="--h-darker:#569CD6;--h-rose-pine-dawn:#286983">rho</span><span style="--h-darker:#4EC9B0;--h-rose-pine-dawn:#56949F"> x </span><span style="--h-darker:#4EC9B0;--h-rose-pine-dawn:#797593">-</span><span style="--h-darker:#4EC9B0;--h-rose-pine-dawn:#56949F"> y </span><span style="--h-darker:#4EC9B0;--h-rose-pine-dawn:#797593">-</span><span style="--h-darker:#4EC9B0;--h-rose-pine-dawn:#56949F"> xz </span><span style="--h-darker:#C586C0;--h-rose-pine-dawn:#286983;--h-darker-font-style:italic;--h-rose-pine-dawn-font-style:inherit">\\</span></span>
<span data-line="5"><span style="--h-darker:#4EC9B0;--h-rose-pine-dawn:#797593">\</span><span style="--h-darker:#4EC9B0;--h-rose-pine-dawn:#286983">dot</span><span style="--h-darker:#4EC9B0;--h-rose-pine-dawn:#797593">&lbrace;</span><span style="--h-darker:#4EC9B0;--h-rose-pine-dawn:#56949F">z</span><span style="--h-darker:#4EC9B0;--h-rose-pine-dawn:#797593">&rbrace;</span><span style="--h-darker:#C586C0;--h-rose-pine-dawn:#286983;--h-darker-font-style:italic;--h-rose-pine-dawn-font-style:inherit"> &#x26;</span><span style="--h-darker:#4EC9B0;--h-rose-pine-dawn:#56949F"> = </span><span style="--h-darker:#4EC9B0;--h-rose-pine-dawn:#797593">-</span><span style="--h-darker:#569CD6;--h-rose-pine-dawn:#797593">\</span><span style="--h-darker:#569CD6;--h-rose-pine-dawn:#286983">beta</span><span style="--h-darker:#4EC9B0;--h-rose-pine-dawn:#56949F"> z </span><span style="--h-darker:#4EC9B0;--h-rose-pine-dawn:#797593">+</span><span style="--h-darker:#4EC9B0;--h-rose-pine-dawn:#56949F"> xy</span></span>
<span data-line="6"><span style="--h-darker:#DCDCAA;--h-rose-pine-dawn:#797593;--h-darker-font-style:inherit;--h-rose-pine-dawn-font-style:italic">\</span><span style="--h-darker:#DCDCAA;--h-rose-pine-dawn:#B4637A;--h-darker-font-style:inherit;--h-rose-pine-dawn-font-style:italic">end</span><span style="--h-darker:#D4D4D4;--h-rose-pine-dawn:#797593">&lbrace;</span><span style="--h-darker:#9CDCFE;--h-rose-pine-dawn:#907AA9;--h-darker-font-style:inherit;--h-rose-pine-dawn-font-style:italic">align</span><span style="--h-darker:#D4D4D4;--h-rose-pine-dawn:#797593">&rbrace;</span></span>
<span data-line="7"><span style="--h-darker:#6A9955;--h-rose-pine-dawn:#9893A5;--h-darker-font-style:italic;--h-rose-pine-dawn-font-style:italic">\] </span><span style="--h-darker:#6A9955;--h-rose-pine-dawn:#797593;--h-darker-font-style:italic;--h-rose-pine-dawn-font-style:italic">--&gt;</span></span></code></pre></div>
	</div>

	<div>
		<p>Author without the highlighting extension:</p>
		<!-- shiki-start
```md
&openhtmlcomment; \[
\begin{align}
\dot{x} & = \sigma(y-x) \\
\dot{y} & = \rho x - y - xz \\
\dot{z} & = -\beta z + xy
\end{align}
\] &closehtmlcomment;
```
shiki-end -->
	</div>
</div>

<p>After preprocessing:</p>

<!-- \[
\begin{align}
\dot{x} & = \sigma(y-x) \\
\dot{y} & = \rho x - y - xz \\
\dot{z} & = -\beta z + xy
\end{align}
\] -->

<HAnchor tag="h4" title="Inline" />

<div class="grid gap-4 lg:grid-cols-2">
	<div>
		<p>With highlighting extension:</p>
		<!-- prettier-ignore -->
		<div class="code-wrapper"><pre style="--h-darker:#D4D4D4;--h-rose-pine-dawn:#575279;--h-darker-bg:#000;--h-rose-pine-dawn-bg:#faf4ed"><code><span data-line="1"><span style="--h-darker:#6A9955;--h-rose-pine-dawn:#797593;--h-darker-font-style:italic;--h-rose-pine-dawn-font-style:italic">&lt;!-- \(</span><span style="--h-darker:#4EC9B0;--h-rose-pine-dawn:#56949F"> a</span><span style="--h-darker:#4EC9B0;--h-rose-pine-dawn:#797593">^</span><span style="--h-darker:#B5CEA8;--h-rose-pine-dawn:#D7827E">2</span><span style="--h-darker:#4EC9B0;--h-rose-pine-dawn:#797593"> +</span><span style="--h-darker:#4EC9B0;--h-rose-pine-dawn:#56949F"> b</span><span style="--h-darker:#4EC9B0;--h-rose-pine-dawn:#797593">^</span><span style="--h-darker:#B5CEA8;--h-rose-pine-dawn:#D7827E">2</span><span style="--h-darker:#4EC9B0;--h-rose-pine-dawn:#56949F"> = c</span><span style="--h-darker:#4EC9B0;--h-rose-pine-dawn:#797593">^</span><span style="--h-darker:#B5CEA8;--h-rose-pine-dawn:#D7827E">2</span><span style="--h-darker:#6A9955;--h-rose-pine-dawn:#797593;--h-darker-font-style:italic;--h-rose-pine-dawn-font-style:italic"> \) --&gt;</span></span></code></pre></div>
	</div>

	<div>
		<p>Without highlighting extension:</p>
		<!-- shiki-start
~~~md
&openhtmlcomment; \( a^2 + b^2 = c^2 \) &closehtmlcomment;
~~~
shiki-end -->
	</div>
</div>

<p>After preprocessing: <!-- \( a^2 + b^2 = c^2 \) --></p>

<HAnchor tag="h3" title="JavaScript Template Literal" />

<p>Make a couple simple wrapper components</p>

<!-- shiki-ts Inline.svelte shiki-ts -->

<!-- shiki-start
```svelte
<script lang="ts">
	import { katex } from '..';

	export const { eq } = $props();
</script>

{@html katex.renderToString(eq)}
```
shiki-end -->

<!-- shiki-ts Display.svelte shiki-ts -->

<!-- shiki-start
```svelte
<script lang="ts">
	import { katex } from '..';

	export const { eq } = $props();
</script>

<div class="overflow-x-auto">{@html katex.renderToString(eq, { displayMode: true })}</div>
```
shiki-end -->

<ol>
	<li>
		Create an equation with the <code>LaTeX</code> template tagged literal.
	</li>
	<li>Pass the string to either the <code>Display</code> or <code>Math</code> components.</li>
	<li>Enjoy regular variable substitution directly in <code class="text-xs"><!-- \( \LaTeX \) --></code>!</li>
</ol>

<div class="grid gap-4 lg:grid-cols-2">
	<div>
		<p>Without highlighting extension:</p>
		<!-- shiki-start
```ts
const eq1 = LaTeX`
	x = {-b \pm \sqrt{b^2-4ac} \over 2a}
`;
```
shiki-end -->
	</div>

	<div>
		<p>With highlighting extension:</p>
		<!-- prettier-ignore -->
		<div class="code-wrapper"><pre style="--h-darker:#D4D4D4;--h-rose-pine-dawn:#575279;--h-darker-bg:#000;--h-rose-pine-dawn-bg:#faf4ed"><code><span data-line="1"><span style="--h-darker:#569CD6;--h-rose-pine-dawn:#286983;--h-darker-font-style:italic;--h-rose-pine-dawn-font-style:inherit">const</span><span style="--h-darker:#4FC1FF;--h-rose-pine-dawn:#575279;--h-darker-font-style:inherit;--h-rose-pine-dawn-font-style:italic"> eq1</span><span style="--h-darker:#D4D4D4;--h-rose-pine-dawn:#286983"> =</span><span style="--h-darker:#DCDCAA;--h-rose-pine-dawn:#D7827E"> LaTeX</span><span style="--h-darker:#CE9178;--h-rose-pine-dawn:#EA9D34">`</span></span>
<span data-line="2">  <span style="--h-darker:#D4D4D4;--h-rose-pine-dawn:#575279">x = &lbrace;-b </span><span style="--h-darker:#DCDCAA;--h-rose-pine-dawn:#797593;--h-darker-font-style:inherit;--h-rose-pine-dawn-font-style:italic">\</span><span style="--h-darker:#DCDCAA;--h-rose-pine-dawn:#B4637A;--h-darker-font-style:inherit;--h-rose-pine-dawn-font-style:italic">pm</span><span style="--h-darker:#DCDCAA;--h-rose-pine-dawn:#797593;--h-darker-font-style:inherit;--h-rose-pine-dawn-font-style:italic"> \</span><span style="--h-darker:#DCDCAA;--h-rose-pine-dawn:#B4637A;--h-darker-font-style:inherit;--h-rose-pine-dawn-font-style:italic">sqrt</span><span style="--h-darker:#D4D4D4;--h-rose-pine-dawn:#575279">&lbrace;b^2-4ac} </span><span style="--h-darker:#DCDCAA;--h-rose-pine-dawn:#797593;--h-darker-font-style:inherit;--h-rose-pine-dawn-font-style:italic">\</span><span style="--h-darker:#DCDCAA;--h-rose-pine-dawn:#B4637A;--h-darker-font-style:inherit;--h-rose-pine-dawn-font-style:italic">over</span><span style="--h-darker:#D4D4D4;--h-rose-pine-dawn:#575279"> 2a}</span></span>
<span data-line="3"><span style="--h-darker:#CE9178;--h-rose-pine-dawn:#EA9D34">`</span><span style="--h-darker:#D4D4D4;--h-rose-pine-dawn:#797593">;</span></span></code></pre></div>
	</div>
</div>

<p>After preprocessing:</p>

<Display eq={eq1} />

<HAnchor tag="h2" title="Reactivity" />

<p>This is Svelte, so let's write reactive LaTeX!</p>

{#snippet increase_r()}
	<div class="flex gap-4">
		<button class="btn btn-accent" onclick={() => (r = r + 1)}>
			Increase <span class="italic">r</span>
		</button>
	</div>
{/snippet}

<Display {eq}></Display>

<div class="flex justify-center">{@render increase_r()}</div>

<HAnchor tag="h3" title="With Template Literals" />

<!-- shiki-start
```svelte
<script lang="ts">
	let r = $state(1);
	const A = $derived((Math.PI * r ** 2).toFixed(2));

	const eq = $derived(`\\begin{align}
r &= ${r} \\\\
r^2 &= ${r ** 2} \\\\
A = \\pi r^2 &= ${A} \\\\
\\end{align}`);
</script>

<Display {eq}></Display>
```
shiki-end -->

<p>
	With template literals, all the backslashes must be escaped. Considering the amount that LaTeX uses, this can be
	tedious. It also has the drawback of destroying the syntax highlighting. To get around this, we can use a special
	LaTeX command directly in the template.
</p>

<HAnchor tag="h3" title="In the Markup" />

<p>Use <code>\s</code> to define a reactive Svelte variable.</p>
<div class="grid gap-4 lg:grid-cols-2">
	<div>
		<h4>With hardcoded values.</h4>
		<!-- shiki-start
~~~latex
\begin{align}
r &= 2 \\
r^2 &= 4 \\
A = \pi r^2 &= 12.57 \\
\end{align}
~~~
shiki-end -->
	</div>
	<div>
		<h4>With svelte values.</h4>
		<!-- shiki-start
~~~latex
\begin{align}
r &= \s{r} \\
r^2 &= \s{r ** 2} \\
A = \pi r^2 &= \s{A} \\
\end{align}
~~~
shiki-end -->
	</div>

	<div>
		<h4>Hardcoded</h4>
		<!-- \[
			\begin{align}
			r &= {2} \\
			r^2 &= {4} \\
			A = \pi r^2 &= {12.57} \\
			\end{align}
		\] -->
	</div>

	<div>
		<h4>Sveltiful!</h4>
		<!-- \[
\begin{align}
r &= \s{r} \\
r^2 &= \s{r**2} \\
A = \pi r^2 &= \s{A} \\
\end{align}
\] -->
	</div>
</div>

<div class="flex justify-end">{@render increase_r()}</div>

<HAnchor tag="h3" title="Behind the scenes" />

<h4>(If you care about how it works under the hood).</h4>

<p>
	The markup is preprocessed with KaTeX before Svelte does its thing. That means regular Svelte handlebar substitution
	can't work. KaTeX would choke on the syntax. We need to pluck out the Svelte content, store it, pass the Svelte free
	content to KaTeX, and then put the Svelte content back in when KaTeX has finished.
</p>

<p>
	The first task is to define some token so when the preprocessor is parsing the content, it knows we're about to pass
	Svelte content in. <code>`\s&lbrace;&rbrace;`</code> was chosen because it looks like LaTeX, highlights nicely, and isn't
	already registered with KaTeX.
</p>

<p>
	Next, we need a way to store the extracted content. Because of the way KaTeX works, we can't assume that the order we
	removed Svelte content is the order we'll need to add it back. In fact, KaTeX will add in the same value multiple
	times and in unpredictable ordering. We need unique placeholders. <code>svelte1</code>, <code>svelte2</code>,
	<code>svelte3</code>, etc. wouldn't work because each char would be split into its own span, making it inefficient to
	replace with the original content. Instead some Unicode values are used as unique temporary placeholders.
</p>

<!-- shiki-start
```js
// the nuts and bolts of it
const { svelteFreeString, extractedSvelteContent } = replaceSvelteAndStore(rawInput);
const mathString = katex.renderToString(svelteFreeString)
const parsed = restoreSvelte(mathString, extractedSvelteContent);
```
shiki-end -->
