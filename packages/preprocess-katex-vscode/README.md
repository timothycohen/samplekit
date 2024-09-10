# Syntax Highlighting for Math in Svelte Templates

This extension adds syntax highlighting to – and snippets for – the [@samplekit/preprocess-katex](https://www.npmjs.com/package/@samplekit/preprocess-katex) NPM package.

The NPM package allows you to write math (via KaTeX) directly in Svelte templates without disrupting other tools like svelte-check, Prettier, ESLint, TypeScript, etc.

## Examples

### In Svelte Markup

#### Without Extension

<img alt="KaTeX display in HTML comment without extension." src="https://raw.githubusercontent.com/timothycohen/samplekit/main/packages/preprocess-katex-vscode/static/demo-comment-katex-before.png" width="300" />

#### With Extension

<img alt="KaTeX display in HTML comment with extension." src="https://raw.githubusercontent.com/timothycohen/samplekit/main/packages/preprocess-katex-vscode/static/demo-comment-katex.png" width="300" />

### In JS Tagged Template Literal

#### Without Extension

<img alt="KaTeX in template literal without extension." src="https://raw.githubusercontent.com/timothycohen/samplekit/main/packages/preprocess-katex-vscode/static/demo-template-katex-before.png" width="300" />

#### With Extension

<img alt="KaTeX in template literal with extension." src="https://raw.githubusercontent.com/timothycohen/samplekit/main/packages/preprocess-katex-vscode/static/demo-template-katex.png" width="300" />

## Supported Syntax

The supported syntax matches that of the NPM package's preprocessor.

In Svelte markup, use `<!-- \[ \] -->` for display mode and `<!-- \( \) -->` for inline mode.

For JS tagged template literals, use <code>katex\`</code> or <code>latex\`</code> (case insensitive).

## Links

- [Docs](https://preprocessors.samplekit.dev/docs/math/)
- [Extension on the VSCode Marketplace](https://marketplace.visualstudio.com/items?itemName=samplekit.svelte-pp-katex)
- [Extension Source](https://github.com/timothycohen/samplekit/tree/main/packages/preprocess-katex-vscode)
- [Companion NPM Package](https://www.npmjs.com/package/@samplekit/preprocess-katex)
- [Companion Package Source](https://github.com/timothycohen/samplekit/tree/main/packages/preprocess-katex)
