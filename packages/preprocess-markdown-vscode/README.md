# Syntax Highlighting for Markdown in Svelte Templates

This extension adds syntax highlighting to – and snippets for – the [@samplekit/preprocess-markdown](https://www.npmjs.com/package/@samplekit/preprocess-markdown) NPM package.

The NPM package allows you to write Markdown (via Marked) directly in Svelte templates without disrupting other tools like svelte-check, Prettier, ESLint, TypeScript, etc.

## Examples

### Without Extension

<img alt="Markdown in HTML comment without extension." src="https://raw.githubusercontent.com/timothycohen/samplekit/main/packages/preprocess-markdown-vscode/static/demo-comment-md-before.png" width="300" />

### With Extension

<img alt="Markdown in HTML comment with extension." src="https://raw.githubusercontent.com/timothycohen/samplekit/main/packages/preprocess-markdown-vscode/static/demo-comment-md.png" width="300" />

## Supported Syntax

The supported syntax matches that of the NPM package's preprocessor.

In Svelte markup, wrap Markdown with `<!-- md-start md-end -->`.

## Links

- [Docs](https://preprocessors.samplekit.dev/docs/markdown/)
- [Extension on the VSCode Marketplace](https://marketplace.visualstudio.com/items?itemName=samplekit.svelte-pp-markdown)
- [Extension Source](https://github.com/timothycohen/samplekit/tree/main/packages/preprocess-markdown-vscode)
- [Companion NPM Package](https://www.npmjs.com/package/@samplekit/preprocess-markdown)
- [Companion Package Source](https://github.com/timothycohen/samplekit/tree/main/packages/preprocess-markdown)
