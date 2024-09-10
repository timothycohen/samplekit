# Syntax Highlighting for Decorated Code Blocks in Svelte Templates

This extension adds syntax highlighting to – and snippets for – the [@samplekit/preprocess-shiki](https://www.npmjs.com/package/@samplekit/preprocess-shiki) NPM package.

The NPM package allows you to write decorated code blocks (via Shiki) directly in Svelte templates without disrupting other tools like svelte-check, Prettier, ESLint, TypeScript, etc.

## Examples

### Without Extension

<img alt="Codeblock in HTML comment without extension." src="https://raw.githubusercontent.com/timothycohen/samplekit/main/packages/preprocess-shiki-vscode/static/demo-comment-code-before.png" width="300" />

### With Extension

<img alt="Codeblock in HTML comment with extension." src="https://raw.githubusercontent.com/timothycohen/samplekit/main/packages/preprocess-shiki-vscode/static/demo-comment-code.png" width="300" />

## Supported Syntax

The supported syntax matches that of the NPM package's preprocessor.

In Svelte markup, wrap blocks with `<!-- shiki-start shiki-end -->` and one liners with `<!-- shiki-svelte shiki-svelte -->`, `<!-- shiki-html shiki-html -->`, etc.

## Links

- [Docs](https://preprocessors.samplekit.dev/docs/code-decoration/)
- [Extension on the VSCode Marketplace](https://marketplace.visualstudio.com/items?itemName=samplekit.svelte-pp-shiki)
- [Extension Source](https://github.com/timothycohen/samplekit/tree/main/packages/preprocess-shiki-vscode)
- [Companion NPM Package](https://www.npmjs.com/package/@samplekit/preprocess-shiki)
- [Companion Package Source](https://github.com/timothycohen/samplekit/tree/main/packages/preprocess-shiki)
