<script lang="ts">
	import { HAnchor, Admonition } from '$lib/components';
	import I from '$lib/icons';
	import { useCodeThemeCtx } from '../codeTheme.ctx.svelte';

	const { data } = $props();
	const codeTheme = useCodeThemeCtx();
</script>

<svelte:head>
	<title>Code Decoration Preprocessor | SampleKit</title>
</svelte:head>

<HAnchor tag="h1" title="Code Decoration" dataToc={null} />

<p>
	The <a data-external href="https://www.npmjs.com/package/@samplekit/preprocess-shiki">
		<span class="font-mono text-base">@samplekit/preprocess-shiki</span>
	</a>
	npm package and
	<a data-external href="https://marketplace.visualstudio.com/items?itemName=samplekit.svelte-pp-shiki">
		<span class="font-mono text-base">samplekit.svelte-pp-shiki</span>
	</a>
	VS Code extension allow you to write code blocks to be decorated by
	<a data-external href="https://shiki.style/">Shiki</a> directly within your Svelte template.
</p>

<HAnchor tag="h2" title="Feature Overview" />

<ul>
	<li class="feature">
		<I.CircleCheckBig class="feature-icon" />
		<span class="feature-title">Write decorated code in your Svelte.</span>
		<div class="feature-content">
			<span class="text-lg">
				<!-- shiki-start
d"has-focus" p
s"spotlight" d"highlight"
```ts
const focusedFeature = () => {
	return 'spotlight'; //! c"focus"
}
```
shiki-end -->
			</span>
			<span class="font-mono">@samplekit/preprocess-shiki</span> wraps
			<a data-external href="https://shiki.style/">Shiki</a>, a package that parses code blocks, converts them to HTML,
			and adds CSS variables. You can pass a custom Shiki
			<code>Highlighter</code>, provide custom themes and languages, or use the themes and languages bundled with Shiki.
			Because you have full control over the output CSS, you can style however you'd like!
		</div>
	</li>

	<li class="feature">
		<I.CircleCheckBig class="feature-icon" />
		<span class="feature-title">Work with existing tooling.</span>
		<p class="feature-content">
			By using a <code>shiki-</code> delimiter inside regular HTML comments, authoring in normal
			<code>.svelte</code> files is possible. It also ensures
			<code>Prettier, ESLint, svelte-check, svelte.svelte-vscode</code>, etc. leave the code alone. This lightweight
			approach preserves your control over the DOM and means there's no need to invent a new file extension like
			<code class="code line-through">.svx</code> or to disable other tools. The Shiki blocks are processed into regular
			HTML with CSS variables before Svelte sees it. If the preprocessor isn't installed yet, nothing breaks – the code
			simply turns into an HTML comment. There's also a complementary preprocessor which handles
			<a href="/docs/markdown">generic markdown</a> using Marked.
		</p>
	</li>

	<li class="feature">
		<I.CircleCheckBig class="feature-icon" />
		<span class="feature-title">Add any data attributes or class to any line, substring, or index range.</span>
		<div class="feature-content">
			<!-- shiki-start
p c"no-lines"
s"tailwind" c"bg-gradient-to-r from-accent-5/50 to-accent-9/50 text-lg"
```ts
// btw, it works with tailwind too
```
shiki-end -->
			There are no fixed <code>highlight</code> or <code>diff</code> classes. Simply write
			<code>c"bazinga"</code> to add a bazinga class and <code>s"tailwind"</code> to highlight the tailwind substring. This
			works by wrapping Shiki's Decorations API.
		</div>
	</li>

	<li class="feature">
		<I.CircleCheckBig class="feature-icon" />
		<span class="feature-title">Write inline code too.</span>
		<span class="feature-content">
			You can easily show off something like
			<!-- shiki-ts const foo shiki-ts -->
			on the same line by writing:
			<!-- shiki-start
t-shiki-ts-inline
```ts
const foo
```
shiki-end -->. More generally, you can register custom default
			properties and <code>ShikiTransformer</code>s to transform the decorated HTML in any way you'd like.
		</span>
	</li>

	<li class="feature">
		<I.CircleCheckBig class="feature-icon" />
		<span class="feature-title">Code with TextMate support.</span>
		<span class="feature-content">
			The <a data-external href="https://marketplace.visualstudio.com/items?itemName=samplekit.svelte-pp-shiki">
				<span class="font-mono">VS Code extension</span>
			</a>
			detects the default languages and injects code syntax highlighting directly into your Svelte files. Because VS Code
			and Shiki both use TextMate grammar, you can easily configure your rendered output to match your code editor. This
			is what it looks like while editing in a <code>.svelte</code> file with the
			<code><a data-external href={codeTheme.href}>{codeTheme.name}</a></code> theme installed:

			<span class="mt-6 block lg:text-lg">
				<!-- shiki-start
t-shiki-block
~~~md
```css
pre[data-shiki-block] code > [data-line-diff-add]::before {
	content: '+';
	color: hsl(var(--success-9));
}
```
~~~
shiki-end -->
			</span>
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
pnpm add -D @samplekit/preprocess-shiki
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
d"diff-add" l"1" l"5-8" l"13-17"
```ts
import { createShikiLogger, processCodeblockSync, getOrLoadOpts } from '@samplekit/preprocess-shiki';
import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const opts = await getOrLoadOpts();

const preprocessorRoot = `${import.meta.dirname}/src/routes/`;
const formatFilename = (/** @type {string} */ filename) => filename.replace(preprocessorRoot, '');

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: [
		processCodeblockSync({
			include: (filename) => filename.startsWith(preprocessorRoot),
			logger: createShikiLogger(formatFilename),
			opts,
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

			<Admonition kind="note">
				Among other customizations, <!-- shiki-ts getOrLoadOpts() shiki-ts --> accepts a Shiki
				<code>Highlighter</code> or a combination of custom themes/languages and Shiki pre-bundled theme/language names.
				If none are provided, it creates a
				<a
					data-external
					href="https://github.com/timothycohen/samplekit/tree/main/packages/preprocess-shiki/src/defaultOpts.ts"
				>
					default
				</a>. Every language you've loaded will be available to the preprocessor in inline and fenced code.
			</Admonition>
		</span>
	</li>

	<li class="step">
		<span class="step-title">Install the VS Code extension (for snippets and syntax highlighting)</span>
		<span class="step-content">
			<a data-external href="https://marketplace.visualstudio.com/items?itemName=samplekit.svelte-pp-shiki">
				samplekit.svelte-pp-shiki
			</a>
		</span>
	</li>
</ol>

<HAnchor tag="h2" title="Example Usage" />

<HAnchor tag="h3" title="Inline Code" />
<div class="grid grid-cols-1 lg:grid-cols-2 lg:gap-4">
	<div>
		<p>Author with the highlighting extension:</p>
		<!-- shiki-start
t-shiki-ts-block
```ts
const foo = "bar";
```
shiki-end -->
	</div>

	<div>
		<p>Author without the highlighting extension:</p>
		<!-- shiki-start
p c"no-lines"
```md
&openhtmlcomment; shiki-ts const foo = "bar"; shiki-ts &closehtmlcomment;
```
shiki-end -->
	</div>
</div>

<div>
	Rendered with custom CSS: <!-- shiki-ts const foo = "bar"; shiki-ts -->
</div>

<HAnchor tag="h3" title="Fenced Code" />

<div class="grid grid-cols-1 lg:grid-cols-2 lg:gap-4">
	<div>
		<p>Author with the highlighting extension:</p>

		<!-- shiki-start
t-shiki-block
~~~md
l"2" d"highlight"
```ts
console.log('hello world');
const highlighted = true;
```
~~~
shiki-end -->
	</div>

	<div>
		<p>Author without the highlighting extension:</p>
		<!-- shiki-start
~~~md
&openhtmlcomment; shiki-start
l"2" d"highlight"
```ts
console.log('hello world');
const highlightedLine = true;
```
shiki-end &closehtmlcomment;
~~~
shiki-end -->
	</div>
</div>

<p>Rendered with custom CSS:</p>
<!-- shiki-start
l"2" d"highlight"
```ts
console.log('hello world');
const highlightedLine = true;
```
shiki-end -->

<Admonition kind="tip">
	The <code>l</code> and <code>d</code> between the delimiter and code fence stand for line range and data attribute
	respectively. Lines of option groups such as this one are how you define decorations. You can also add classes with
	<code>"c"</code>
	and target different locations using <code>"s"</code>
	for substring, <code>"i"</code> for index range, <code>"L"</code> for all lines, or
	<code>"p"</code> for pre. See <a href="#decoration-options">Decoration Options</a> for details.
</Admonition>

<HAnchor tag="h2" title="Output Structure" />

<div class="p">
	The preprocessor transpiles the code to HTML and injects styles that you can target with CSS. If no
	<code>cssVarToThemeName</code> is defined in <code>opts</code>, the default is used:
	<!-- shiki-ts { dark: 'darker', light: 'rose-pine-dawn' } shiki-ts -->
	. The
	<code>opts</code> parameter used on this site includes the default custom theme –
	<code>
		<a
			data-external
			href="https://github.com/timothycohen/samplekit/blob/main/packages/preprocess-shiki/src/themes/darker.ts"
		>
			Darker
		</a>
	</code> – and two extra Shiki bundled themes:
</div>

<!-- shiki-start
```js
const opts = await getOrLoadOpts({
	highlighter: {
		lang: { bundled: ['svelte', 'latex'] },
		theme: { bundled: ['rose-pine-dawn', 'catppuccin-latte'] }, // to remove 'darker', pass in custom: []
		cssVarToThemeName: { daffodil: 'rose-pine-dawn', dark: 'darker', bellflower: 'catppuccin-latte' },
	},
});
```
shiki-end -->

<p>
	Each definition provided to <code>cssVarToThemeName</code> outputs a css variable on the HTML prepended with
	<code>cssVarPrefix</code>.
</p>

<!-- eslint-disable-next-line svelte/no-at-html-tags -->
{@html data.processedCodeblockExample}

<Admonition kind="info">
	By default, the <!-- shiki-html <pre> shiki-html --> tag has data attributes containing the language and transform. Each
	line is wrapped in <!-- shiki-html <span data-line> shiki-html --> and each index or substring match is wrapped in
	<!-- shiki-html <span data-window> shiki-html -->. This is determined by the
	<a href="#transform-map">transform map</a> and is fully customizable.
</Admonition>

<HAnchor tag="h2" title="Decoration Options" />

<p>
	There are no fixed Shiki <code>Transformers</code> to use. Instead, you can write any arbitrary data property or class
	with some simple syntax between the opening delimiter and code fence (either
	<code>```</code> or <code>~~~</code>). Each option group requires at least one value and one location.
</p>

<HAnchor tag="h3" title="Locations and Values" />

<div>
	<!-- md-start
| Kind     | Description    | Example                                                            |
| -------- | -------------- | ------------------------------------------------------------------ |
| location | line range     | <code>l"3"</code> or <code>l"5-7"</code> |
| location | substring      | <code>s"console"</code>                               |
| location | index range    | <code>i"3-5"</code>                                   |
| location | all lines      | <code>L</code>                                        |
| location | pre            | <code>p</code>                                        |
| value    | class          | <code>c"focus"</code>                                 |
| value    | data attribute | <code>d"highlight"</code>                             |
md-end -->
</div>

<Admonition kind="info">
	Line and index ranges start at 1. You can write multiple lines or multiple options on one line. For example,
	<code>l"4-7" l"15" c"highlight" d"diff-add"</code>
	will add class <code>.highlight</code> and <code>data-line-diff-add</code> to lines 4-7 and 15.
</Admonition>

<Admonition kind="important">
	All code fenced lines have <code>data-line</code>. The <!-- shiki-html <pre> shiki-html --> tag has data attributes as
	well. Adjust the defaults via the <a href="#transform-map">transform map</a>.
</Admonition>

<HAnchor tag="h3" title="Basic Examples" />

<p>To add the <code>data-line-highlight</code> property on line 1, write it like so:</p>

<!-- shiki-start
t-shiki-block
~~~md
l"1" d"highlight"
```ts
const highlighted = true;
```
~~~
shiki-end -->

<!-- shiki-start
l"1" d"highlight"
```ts
const highlighted = true;
```
shiki-end -->

<p>To highlight the first 5 characters using custom tailwind classes:</p>

<!-- shiki-start
t-shiki-block
~~~md
i"1-5" c"bg-gradient-to-r from-accent-5/50 to-accent-9/75"
```ts
const highlighted = true;
```
~~~
shiki-end -->

<!-- shiki-start
i"1-5" c"bg-gradient-to-r from-accent-5/50 to-accent-9/75"
```ts
const highlighted = true;
```
shiki-end -->

<p>To highlight the word `highlight`:</p>

<!-- shiki-start
t-shiki-block
~~~md
d"highlight" s"highlight"
```ts
const highlighted = true;
```
~~~
shiki-end -->

<!-- shiki-start
d"highlight" s"highlight"
```ts
const highlighted = true;
```
shiki-end -->

<p>To highlight the word `foo` on lines 2 and 3:</p>

<!-- shiki-start
t-shiki-block
~~~md
l"2-3" d"highlight" s"foo"
```md
If every foo has its bar,
and every bar has its foo,
what is a quux foo bar?
```
~~~
shiki-end -->

<!-- shiki-start
l"2-3" d"highlight" s"foo"
```md
If every foo has its bar,
and every bar has its foo,
what is a quux foo bar?
```
shiki-end -->

<p>To highlight the 4th to 51st characters starting on line 2:</p>
<!-- shiki-start
t-shiki-block
~~~md
l"2-3" d"highlight" i"4-51"
```md
# Problem:
If every foo has its bar,
and every bar has its foo,
what is a quux foo bar?
```
~~~
shiki-end -->

<!-- shiki-start
l"2-3" d"highlight" i"4-51"
```md
# Problem:
If every foo has its bar,
and every bar has its foo,
what is a quux foo bar?
```
shiki-end -->

<HAnchor tag="h3" title="Inline Options" />

<div class="p">
	You can also write inline syntax using <!-- shiki-ts //! shiki-ts --> and the same <code>d</code>,
	<code>c</code>, <code>s</code>, <code>i</code> options as above. The attribute or class always applies to the line
	you're on, so you can't use <code>l</code>,
	<code>L</code>, or <code>p</code> after <!-- shiki-ts //! shiki-ts -->. To add
	<code>data-has-focus</code> to the <!-- shiki-html <pre> shiki-html -->
	element and the <code>.focus</code> class on the line with `spotlight`:
</div>

<!-- shiki-start
t-shiki-block
~~~md
d"has-focus" p
```ts
const focusedFeature = () => {
	return 'spotlight'; //!p c"focus"
}
```
~~~
shiki-end -->

<!-- shiki-start
d"has-focus" p
```ts
const focusedFeature = () => {
	return 'spotlight'; //! c"focus"
}
```
shiki-end -->

<Admonition kind="note">
	Writing <code>//!p</code> will render <code>//!</code> and ignore the option.
</Admonition>

<HAnchor tag="h3" title="Options with Quotes" />
<p>
	The option strings are similar to
	<a data-external href="https://doc.rust-lang.org/stable/reference/tokens.html#raw-string-literals"
		>Rust raw string literals</a
	>. To match <code>foo</code>, write <code>s"foo"</code>.
</p>

<!-- shiki-start
t-shiki-block
~~~md
d"highlight" s"foo"
```ts
const myString = `works!foo`;
```
~~~
shiki-end -->

<!-- shiki-start
d"highlight" s"foo"
```ts
const myString = `works!foo`;
```
shiki-end -->

<p>
	If you want to match quotation marks – such as <code>"foo"</code> – wrap your string in a
	<code>#</code>
	delimiter like so:
	<code>s#""foo""#</code>.
</p>

<!-- shiki-start
t-shiki-block
~~~md
d"highlight" s#""foo""#
```ts
const myString = `works!"foo"`;
```
~~~
shiki-end -->

<!-- shiki-start
d"highlight" s#""foo""#
```ts
const myString = `works!"foo"`;
```
shiki-end -->

<p>
	If for some <span class="italic">bizarre</span> reason you needed to match
	<code>"#</code>, use two <code>#</code> like so:
	<code>s##"foo"#"##</code>.
</p>

<!-- shiki-start
t-shiki-block
~~~md
d"highlight" s##"foo"#"##
```ts
const myWeirdString = `works!"foo"#bar`;
```
~~~
shiki-end -->

<!-- shiki-start
d"highlight" s##"foo"#"##
```ts
const myWeirdString = `works!"foo"#bar`;
```
shiki-end -->

<p>This method works for an infinite amount of <code>#</code> until your computer gives up the ghost.</p>

<HAnchor tag="h3" title="Escaping" />
<p>
	<code>\n</code> will match the literal string <code>"\n"</code>. If you want it to match the newline character, escape
	it: <code>\\n</code>. The same goes for <code>\</code>,
	<code>\t</code>, and <code>\r</code>.
</p>

<!-- shiki-start
t-shiki-block
~~~md
p c"no-lines"
d"highlight" s"foo\\n\\tbar"
```ts
const multiLineMatch = `foo
	bar`
```
~~~
shiki-end -->

<!-- shiki-start
p c"no-lines"
d"highlight" s"foo\\n\\tbar"
```ts
const multiLineMatch = `foo
	bar`
```
shiki-end -->

<HAnchor tag="h3" title="Hide" />

<p>
	There is one special data attribute: <code>hide</code>. This attribute removes those decorated nodes alongside their
	newline characters. Why? Consider the following two code blocks:
</p>

<!-- shiki-start
```ts
export class Klass { //! d"hide"
public method({ prop }: { prop: Prop }): void {
	this.guard(prop);
	this.#foo = prop.foo + 42;
}
} //! d"hide"
```
shiki-end -->

<!-- shiki-start
```ts
public method({ prop }: { prop: Prop }): void {
	this.guard(prop);
	this.#foo = prop.foo + 42;
}
```
shiki-end -->

<p>
	Notice how the visibility modifier and types are correctly decorated in the first but broken in the second? That's
	because we wrote the first so Shiki understands it's within a class:
</p>

<!-- shiki-start
t-shiki-block
~~~md
```ts
export class Klass { //!p d"hide"
public method({ prop }: { prop: Prop }): void {
	this.guard(prop);
	this.#foo = prop.foo + 42;
}
} //!p d"hide"
```
~~~
shiki-end -->

<!-- shiki-start
t-shiki-block
~~~md
```ts
public method({ prop }: { prop: Prop }): void {
	this.guard(prop);
	this.#foo = prop.foo + 42;
}
```
~~~
shiki-end -->

<Admonition kind="note">
	This is more robust than a CSS <!-- shiki-css .hidden { display: none; } shiki-css --> only approach because it collapses
	neighboring newlines as necessary. It is similar to Shiki's <code>grammarContextCode</code>, but can be used anywhere
	in the string.
</Admonition>

<HAnchor tag="h2" title="Themes and Languages" />

<p>In addition to providing your own Shiki highlighter, the default languages and themes can easily be changed:</p>

<!-- shiki-start
```ts
const defaultBundledLangNames = ['svelte', 'diff', 'json', 'sh', 'sql'];
const defaultCssVarToThemeName = { dark: 'darker', light: 'rose-pine-dawn' };
const defaultcssVarPrefix = '--h-';
```
shiki-end -->

<!-- shiki-start
```ts
const opts = await getOrLoadOpts({
	highlighter: {
		lang: { custom: [], bundled: ['svelte', 'json', 'sh', 'latex'] },
		theme: { custom: [], bundled: ['dracula', 'vitesse-light'] },
		cssVarToThemeName: { drac: 'dracula',  vl: 'vitesse-light' },
	},
	cssVarPrefix: '--decorated-'
});
```
shiki-end -->

<HAnchor tag="h2" title="Transform Map" />

<p>
	The preprocessor first separates the raw string into code, language, decorations, and transform name. If it finds a
	<code>transformName</code> on the first line, it will use the <code>transformMap</code> to add specified properties to
	the decorations list and run <code>ShikiTransformer</code>s. Here are the defaults:
</p>

<!-- shiki-start
```ts
export const defaultTransformMap = {
	block: {
		addDefaultProps: ({ mut_allLines, lang, mut_pre }) => {
			mut_pre.datas = ['shiki', `shiki-lang-${lang}`, 'shiki-t-block', ...(mut_pre.datas ?? [])];
			mut_allLines.datas = ['line', ...(mut_allLines.datas ?? [])];
		},
	},
	inline: {
		addDefaultProps: ({ lang, mut_pre }) => {
			mut_pre.datas = ['shiki', `shiki-lang-${lang}`, 'shiki-t-inline', ...(mut_pre.datas ?? [])];
		},
	},
	'no-pre': {
		addDefaultProps: ({ mut_allLines, mut_code, lang }) => {
			mut_code.datas = ['shiki', `shiki-lang-${lang}`, 'shiki-t-no-pre', ...(mut_code.datas ?? [])];
			mut_allLines.datas?.push('line');
		},
		transforms: [{ postprocess: (html) => html.replace(/^<pre[^>]*>(<code[^>]*>[\s\S]*?<\/code>)<\/pre>$/, '$1') }],
	},
	'no-code': {
		transforms: [
			{ postprocess: (html: string) => html.replace(/^<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>$/, '$1') },
		],
	},
	noop: {},
} satisfies PreprocessOpts['transformMap'];
```
shiki-end -->

<Admonition kind="important">
	A fenced code block will call <!-- shiki-ts block.addDefaultProps() shiki-ts --> and inline code like <!-- shiki-start
t-shiki-ts-inline
```ts
const
```
shiki-end -->
	will call <!-- shiki-ts inline.addDefaultProps() shiki-ts -->. Instead of using the default, you can write the key
	associated with any registered transform object on the first line of your code block.
</Admonition>

<div class="grid grid-cols-1 lg:grid-cols-2 lg:gap-4">
	<div class="p">
		<span>This:</span>
		<!-- shiki-start
t-shiki-block
~~~md
```ts
const foo = "bar";
```
~~~
shiki-end -->
	</div>

	<div class="p">
		<span>is identical to this:</span>
		<!-- shiki-start
t-shiki-block
~~~md
t-block//! d"diff-add"
```ts
const foo = "bar";
```
~~~
shiki-end -->
	</div>
</div>

<div class="p">
	Both use <!-- shiki-ts transformMap['block'] shiki-ts --> which will add data attributes like so: <!-- shiki-start
t-inline
d"highlight" s"t-block"
```html
<pre data-shiki data-shiki-t-block>
```
shiki-end -->.
	This is useful for styling via CSS. Similarly, inline code such as this: <!-- shiki-start
t-shiki-ts-inline
```ts
const foo = "bar";
```
shiki-end -->
	will have a <!-- shiki-start
t-inline
d"highlight" s"t-inline"
```html
<pre data-shiki data-shiki-t-inline>
```
shiki-end -->
	wrapper and is completely equivalent to this:
</div>

<!-- shiki-start
t-shiki-block
~~~md
t-inline//! d"diff-add"
```ts
const foo = "bar";
```
~~~
shiki-end -->

<div class="p">
	You're not limited to these preset registered transform objects. To register your own or modify the default classes
	and data attributes, pass in a custom <code>transformMap</code> to <!-- shiki-ts getOrLoadOpts() shiki-ts -->
	or load them afterwards with <!-- shiki-ts updateOpts() shiki-ts -->.
</div>

<div class="p">
	For example, this website needs to show examples including the <code>shiki-start</code> and
	<code>shiki-end</code> delimiter wrappers, code fence, and language. We've made adding the delimiters a one liner by
	registering a custom postprocess function with the key <!-- shiki-ts 'shiki-block' shiki-ts -->. It takes out the <!-- shiki-html <pre> shiki-html -->
	and <!-- shiki-html <code> shiki-html --> tags and replaces them with our custom wrapper.
</div>

<!-- shiki-start
```ts
opts.transformMap['shiki-block'] = {
	addDefaultProps: defaultTransformMap['block']['addDefaultProps'],
	transforms: [
		{
			postprocess: (html) => {
				const middle = html.replace(/^<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>$/, '$1');
				return shikiBlockWrapper.start + middle + shikiBlockWrapper.end;
			},
		},
	],
};
```
shiki-end -->

<p>Then we can write our examples showing the delimiters:</p>

<!-- shiki-start
t-shiki-block
```md
t-shiki-block //! d"diff-add"
~~~md
&tripgrave;ts
const callMe = "Ishmael"
&tripgrave;
~~~
```
shiki-end -->

<p>And it renders our examples wrapped with our delimiters:</p>

<!-- shiki-start
t-shiki-block
~~~md
```ts
const callMe = "Ishmael"
```
~~~
shiki-end -->

<Admonition kind="note">
	You generally won't have to write fenced code (wrapped in fenced code (wrapped in preprocessor delimiters)) like is
	necessary for this site, but you <span class="italic">sure can</span>.
</Admonition>

<HAnchor tag="h2" title="Whitespace Hints" />

<HAnchor tag="h3" title="Fenced" />

<p>
	The <code>pre</code> tag added by the code fence preserves whitespace, so don't indent your code tags unnecessarily.
</p>

<Admonition kind="error" title="Wrong" childrenClass="px-4 py-3 no-lines">
	<!-- shiki-start
t-shiki-block
~~~md
```ts
		const line = 'preserves whitespace';
```
~~~
shiki-end -->

	<p>Unwanted indentation:</p>

	<!-- shiki-start
```ts
		const line = 'preserves whitespace'; //! d"warn"
```
shiki-end -->
</Admonition>

<Admonition kind="success" title="Right" childrenClass="px-4 py-3 no-lines">
	<!-- shiki-start
t-shiki-block
~~~md
```ts
const line = 'preserves whitespace';
```
~~~
shiki-end -->

	<p>No extra whitespace:</p>

	<!-- shiki-start
```ts
const line = 'preserves whitespace';
```
shiki-end -->
</Admonition>

<HAnchor tag="h3" title="No Pre" />

<div class="p">
	If you are using <!-- shiki-ts transformMap['no-pre'] shiki-ts --> because you absolute
	<span class="italic">must</span>
	write inside a tag like <!-- shiki-html <p> shiki-html --> which doesn't allow nested <!-- shiki-html <pre> shiki-html -->,
	then you'll run into the problem that Svelte
	<a data-external href="https://github.com/sveltejs/svelte/issues/12140"> doesn't respect </a>
	<code>whitespace: pre</code> style. All whitespace will be collapsed like so: <!-- shiki-start
t-no-pre
```ts
const foo = "bar";
```
shiki-end -->
	when we intended
	<!-- shiki-ts const foo = "bar"; shiki-ts -->.
</div>

<p>You can instruct Svelte to respect your whitespace in two ways.</p>

<ol>
	<li>
		<span>Add <code>preserveWhitespace</code> to the component.</span>
		<span class="step-content lg:text-lg">
			<!-- shiki-start
p c"no-lines"
```svelte
<svelte:options preserveWhitespace={true} />
```
shiki-end -->
		</span>
	</li>

	<li>
		<span>
			Add <code>preserveWhitespace</code> to the <code>svelte.config.js</code> compiler options.
		</span>
		<span class="step-content lg:text-lg">
			<!-- shiki-start
p c"no-lines"
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
		</span>
	</li>
</ol>

<HAnchor tag="h2" title="Highlight via JS" />

<div class="p">
	If you want to highlight some code outside of the preprocessor, you can use the Shiki
	<code>Highlighter </code> directly from the <code>opts</code>
	returned from <!-- shiki-ts getOrLoadOpts() shiki-ts -->. Alternatively, you can use
	<!-- shiki-ts codeToDecoratedHtmlSync() shiki-ts -->, which this preprocessor wraps.
</div>

<!-- shiki-start
```ts
type PropertyArrays = { classes: string[]; datas: Array<string | [string, string]> };

type CodeToDecoratedHtml = {
	code: string;
	lang: string;
	opts: HighlightOpts;
	transformName?: string;
	lineToProperties?: Map<number, Partial<PropertyArrays>>;
	windowProperties?: Array<{ start: number; end: number; properties: Partial<PropertyArrays> }>;
	allLinesProperties?: Partial<PropertyArrays>;
	codeProperties?: Partial<PropertyArrays>;
	preProperties?: Partial<PropertyArrays>;
};

// example
const { data, error } = codeToDecoratedHtmlSync({
	code: '<pre></pre>\n<div></div>',
	lang: 'html',
	opts,
	lineToProperties: new Map([[1, { datas: ['im-a-div', 'highlight'] }]]),
	windowProperties: [{ start: 0, end: 5, properties: { datas: ['highlight'] } }],
	allLinesProperties: { datas: ['line'] },
	codeProperties: { classes: ['code-class'] },
	preProperties: { datas: ['shiki'] },
});
```
shiki-end -->

<Admonition kind="note">
	There are no substring or index ranges options here. Calculate what you need and pass them to
	<code>windowProperties</code>.
</Admonition>

<Admonition kind="important">
	Because this API is from JS, the indexes are zero-based, unlike the preprocessor options, which are one-based to match
	the line numbers.
</Admonition>

<HAnchor tag="h2" title="Advanced Options" />

<HAnchor tag="h3" title="Custom Delimiter" />

<div class="p">
	You can change <!-- shiki-ts const defaultCommonDelimiter = 'shiki-' shiki-ts -->
	– referring to the&nbsp;<code>shiki-</code> in <code>shiki-start</code> and
	<code>shiki-end</code> – to anything you want.
</div>

<!-- shiki-start
```ts
const opts = await getOrLoadOpts({
	delimiter: 'coolbeans-'
});
```
shiki-end -->

<Admonition kind="warning">
	Only <code>shiki-</code> is supported by the VS Code syntax highlighting extension.
</Admonition>

<HAnchor tag="h3" title="But wait, there's more!" />

<p>
	See the full options at
	<code>
		<a data-external href="https://github.com/timothycohen/samplekit/tree/main/packages/preprocess-shiki/src/types.ts">
			src/types.ts
		</a>
	</code>.
</p>

<HAnchor tag="h2" title="What About?" />

<p>
	Why use this over <code>fs</code> &RightArrow;
	<a data-external href="https://github.com/unifiedjs/unified">unified</a>
	&RightArrow; <code>rawHTML</code> or
	<a data-external href="https://github.com/pngwn/MDsveX">MDsveX</a> or
	<a data-external href="https://shiki.style/">Shiki</a> on the server / inside a Svelte component, etc.?
</p>

<p>
	Fair question! The <span class="font-mono">@samplekit</span> packages are about making what I feel to be the correct
	trade-offs when interleaving Markdown features in interactive code. I personally don't find Markdown faster to write
	than HTML for anything other than tables, code decoration, and math – hence the scope of the
	<span class="font-mono">@samplekit</span>
	preprocessor family.
</p>
<p>
	I <span class="italic">do</span> appreciate Markdown's serene syntax, but as tempting as that may be, it's not worth
	the sacrifice of even a small part of the TS / Svelte tooling when working with interactive code. Using the humble
	HTML comment allows us to work within an isolated domain of Svelte's world where all tooling respects our
	independence. We can work side by side with all existing tooling, which isn't possible when working in a
	<code>.svx</code> file. Furthermore, this approach <span class="italic">should</span> be isolated from breaking changes
	and associated maintenance burdens that come with any package mixing languages.
</p>
<p>
	This is the impetus for this package's existence – get the good stuff without jettisoning the
	<code>.svelte</code> extension and the wonderful tooling built around the language. The trade-off is that there are three
	separate preprocessors, each with a smaller scope, and each requiring a delimiter around every invocation. If the code
	is mostly static, you're working with non-technical people (who are probably not writing decorated code blocks anyway),
	or you're invested in the remark / rehype ecosystem, a unified pipeline and small build script might be better fit. If
	want to mix Svelte and Markdown, hate preprocessor delimiters and HTML tags, and can handle Svelte with limited tooling,
	MDSveX might work better for you. If you're going to prerender anyway, don't mind bundling Shiki on the client, or don't
	mind passing many small code chunks through your load function, using Shiki directly might be the way (but you'll lose
	the 1:1 match between your code editor's syntax highlighting and the rendered output).
</p>

<style lang="postcss">
	.p {
		@apply my-5 lg:my-6;
	}
</style>
