<script lang="ts">
	import { HAnchor } from '$lib/components';
	import I from '$lib/icons';
	import { Display, LaTeX } from '$lib/math';

	const { data } = $props();

	const eq1 = LaTeX`x = {-b \pm \sqrt{b^2-4ac} \over 2a}`;

	let r = $state(1);
	const A = $derived((Math.PI * r ** 2).toFixed(2));

	const eq = $derived(`\\begin{align*}
r &= ${r} \\\\
r^2 &= ${r ** 2} \\\\
A = \\pi r^2 &= ${A} \\\\
\\end{align*}`);
</script>

<svelte:head>
	<title>Math Preprocessor | SampleKit</title>
</svelte:head>

<HAnchor tag="h1" title="Math" dataToc={null} />

<p>
	The <a data-external href="https://www.npmjs.com/package/@samplekit/preprocess-katex">
		<span class="font-mono text-base">@samplekit/preprocess-katex</span>
	</a>
	npm package and
	<a data-external href="https://marketplace.visualstudio.com/items?itemName=samplekit.svelte-pp-katex">
		<span class="font-mono text-base">samplekit.svelte-pp-katex</span>
	</a>
	VS Code extension allow you to use
	<a data-external href="https://katex.org/docs/supported.html">KaTeX</a> directly within your Svelte template.
</p>

<HAnchor tag="h2" title="Feature Overview" />

<ul>
	<li class="feature">
		<I.CircleCheckBig class="feature-icon" />
		<span class="feature-title">Write beautiful math in Svelte templates.</span>
		<span class="feature-content">
			<span>
				This preprocessor wraps <a data-external href="https://katex.org/docs/supported.html"> KaTeX </a>, a package
				that supports a subset of TeX macros and some higher order LaTeX macros found in packages like amssymb. If
				you're not familiar with TeX, it's a typesetting system commonly used in STEM fields. These macros let you
				easily write math like this <!-- \( x = {-b \pm \sqrt{b^2 - 4ac} \over 2a} \) -->. That equation is written like
				this: <!-- shiki-latex \( x = {-b \pm \sqrt{b^2 - 4ac} \over 2a} \) shiki-latex -->.
			</span>
		</span>
	</li>
	<li class="feature">
		<I.CircleCheckBig class="feature-icon" />
		<span class="feature-title">Eliminate flashes of unstyled content.</span>
		<span class="feature-content">
			By using a preprocessor directly on the server, delays and flashes of unstyled content are avoided. The page can
			also be statically generated if desired.
		</span>
	</li>
	<li class="feature">
		<I.CircleCheckBig class="feature-icon" />
		<span class="feature-title">Work with existing tooling.</span>
		<span class="feature-content">
			There's no need to invent a new file extension or disable other tools. By using regular HTML comments in
			<code>.svelte</code> files we ensure that
			<code>Prettier, ESLint, svelte-check, svelte.svelte-vscode</code>, etc. leave our code alone. The code is
			processed into something Svelte understands, but if the preprocessor isn't installed yet, nothing breaks – the
			code simply turns into an HTML comment.
		</span>
	</li>
	<li class="feature">
		<I.CircleCheckBig class="feature-icon" />
		<span class="feature-title">Code with TextMate support.</span>
		<span class="feature-content">
			The <a
				data-external
				href="https://github.com/timothycohen/samplekit/tree/staging/packages/preprocess-katex-vscode"
			>
				<span class="font-mono text-base">VS Code extension</span>
			</a>
			provides you with full highlighting support. It injects the LaTeX TextMate grammar scope between the delimiters to
			work with your VS Code theme.
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
pnpm add -D @samplekit/preprocess-katex
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
import { processKatex, createKatexLogger } from '@samplekit/preprocess-katex';
import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const preprocessorRoot = `${import.meta.dirname}/src/routes/`;
const formatFilename = (/** @type {string} */ filename) => filename.replace(preprocessorRoot, '');

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: [
		processKatex({
			include: (filename) => filename.startsWith(preprocessorRoot),
			logger: createKatexLogger(formatFilename),
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
			<a data-external href="https://marketplace.visualstudio.com/items?itemName=samplekit.svelte-pp-katex">
				samplekit.svelte-pp-katex
			</a>
		</span>
	</li>
</ol>

<HAnchor tag="h2" title="Svelte Template" />

<HAnchor tag="h3" title="Display" />

<p>There are four wrappers around math:</p>
<ol>
	<li>
		Display math in Svelte templates: <pre class="inline whitespace-nowrap" data-shiki>
	<!-- shiki-start
t-comment-inline
```latex
\[ ... \]
```
shiki-end -->
</pre>
	</li>
	<li>
		Inline math in Svelte templates: <pre class="inline whitespace-nowrap" data-shiki>
	<!-- shiki-start
t-comment-inline
```latex
\( ... \)
```
shiki-end -->
</pre>
	</li>
	<li>
		Display math via JavaScript: <pre class="inline"><!-- shiki-ts const eq = LaTeX`...`; shiki-ts --></pre>
	</li>
	<li>
		Inline math via JavaScript: <pre class="inline"><!-- shiki-ts const eq = LaTeX`...`; shiki-ts --></pre>
	</li>
</ol>

<div class="grid grid-cols-1 lg:grid-cols-2 lg:gap-4">
	<div>
		<p>Author with the highlighting extension:</p>

		<!-- shiki-start
t-katex-block
```latex
\begin{align}
\dot{x} & = \sigma(y-x) \\
\dot{y} & = \rho x - y - xz \\
\dot{z} & = -\beta z + xy
\end{align}
```
shiki-end -->
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

<HAnchor tag="h3" title="Inline" />

<div class="grid grid-cols-1 lg:grid-cols-2 lg:gap-4">
	<div>
		<p>With highlighting extension:</p>

		<!-- shiki-start
t-comment-block
```latex
\( V={4 \over 3}\pi r^{3} \)
```
shiki-end -->
	</div>

	<div>
		<p>Without highlighting extension:</p>
		<!-- shiki-start
~~~md
&openhtmlcomment; \( V={4 \over 3}\pi r^{3} \) &closehtmlcomment;
~~~
shiki-end -->
	</div>
</div>

<p>After preprocessing: <!-- \( V={4 \over 3}\pi r^{3} \) --></p>

<HAnchor tag="h2" title="JavaScript Template Literal" />

<p>
	The VS Code extension also highlights <code>LaTeX</code> template literals. To use it, it's helpful to make a couple simple
	wrapper components
</p>

<div class="code-topper"><span class="code-topper-title">Inline.svelte</span></div>
<!-- shiki-start
```svelte
<script lang="ts">
	import { katex } from '..';

	const { eq }: { eq: string } = $props();
</script>

{@html katex.renderToString(eq)}
```
shiki-end -->

<div class="code-topper"><span class="code-topper-title">Display.svelte</span></div>
<!-- shiki-start
```svelte
<script lang="ts">
	import { katex } from '..';

	const { eq }: { eq: string } = $props();
</script>

<div class="overflow-x-auto">{@html katex.renderToString(eq, { displayMode: true })}</div>
```
shiki-end -->

<ol>
	<li>Create an equation with the <code>LaTeX</code> template tagged literal.</li>
	<li>Pass the string to either the <code>Display</code> or <code>Math</code> components.</li>
	<li>Enjoy regular variable substitution directly in <span class="text-sm"><!-- \( \LaTeX \) --></span>!</li>
</ol>

<div class="grid grid-cols-1 lg:grid-cols-2 lg:gap-4">
	<div>
		<p>With highlighting extension:</p>
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html data.jsTemplateLiteralExample}
	</div>

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
</div>

<p>After preprocessing:</p>

<Display eq={eq1} />

<HAnchor tag="h2" title="Reactivity" />

<p>This is Svelte, so let's write reactive LaTeX directly in the Svelte template!</p>

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

<p>
	With template literals, all the backslashes must be escaped. Considering the amount that LaTeX uses, this can be
	tedious. It also has the drawback of destroying the syntax highlighting.
</p>

<!-- shiki-start
```svelte
<script lang="ts">
	let r = $state(1);
	const A = $derived((Math.PI * r ** 2).toFixed(2));

	const eq = $derived(`\\begin{align*}
r &= ${r} \\\\
r^2 &= ${r ** 2} \\\\
A = \\pi r^2 &= ${A} \\\\
\\end{align*}`);
</script>

<Display {eq}></Display>
```
shiki-end -->

<p>To get around this, we can use a special LaTeX command directly in the template.</p>

<HAnchor tag="h3" title="In the Markup" />

<p>Use <code>\s</code> to define a reactive Svelte variable.</p>
<div class="grid grid-cols-1 lg:grid-cols-2 lg:gap-4">
	<div>
		<h4>With hardcoded values.</h4>
		<!-- shiki-start
~~~latex
\begin{align*}
r &= 2 \\
r^2 &= 4 \\
A = \pi r^2 &= 12.57 \\
\end{align*}
~~~
shiki-end -->
	</div>
	<div>
		<h4>With Svelte values.</h4>
		<!-- shiki-start
~~~latex
\begin{align*}
r &= \s{r} \\
r^2 &= \s{r ** 2} \\
A = \pi r^2 &= \s{A} \\
\end{align*}
~~~
shiki-end -->
	</div>

	<div>
		<h4>Hardcoded</h4>
		<!-- \[
\begin{align*}
r &= {2} \\
r^2 &= {4} \\
A = \pi r^2 &= {12.57} \\
\end{align*}
\] -->
	</div>

	<div>
		<h4>Sveltiful!</h4>
		<!-- \[
\begin{align*}
r &= \s{r} \\
r^2 &= \s{r**2} \\
A = \pi r^2 &= \s{A} \\
\end{align*}
\] -->
	</div>
</div>

<div class="flex justify-end">{@render increase_r()}</div>

<HAnchor tag="h3" title="Behind the scenes" />

<h4>(If you care about how it works under the hood).</h4>

<p>
	Because neither Svelte nor KaTeX can handle each other's syntax we can't simply use regular Svelte handlebar
	substitution. KaTeX would choke on the syntax. Instead, the preprocessor plucks out the Svelte content defined in
	<code>`\s&lbrace;&rbrace;`</code>, stores it, passes the Svelte free content to KaTeX, and then puts the Svelte
	content back in when KaTeX has finished.
</p>

<!-- shiki-start
```js
// the nuts and bolts of it
const { svelteFreeString, extractedSvelteContent } = replaceSvelteAndStore(rawInput);
const mathString = katex.renderToString(svelteFreeString)
const parsed = restoreSvelte(mathString, extractedSvelteContent);
```
shiki-end -->
