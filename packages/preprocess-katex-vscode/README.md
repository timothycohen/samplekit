# KaTeX TextMate Grammar Injection into Svelte Templates

Accompanies the @samplekit/preprocess-katex npm package to inject syntax highlighting into the Svelte template math blocks.

## Features

- injects [text.tex.latex meta.math.block.latex support.class.math.block.environment.latex]() highlighting into HTML comments inside Svelte markup.
- injects [text.katex scope](https://github.com/yzhang-gh/vscode-markdown/blob/master/syntaxes/katex.tmLanguage.json) into tagged template literals in JS
- adds snippets to make it quicker to generate the required HTML comments.

## Svelte HTML Comments

By using HTML comments, it's trivial to write a preprocessor without running afoul of svelte check, prettier, eslint, typescript, etc.

#### `<!-- \[ \] -->` (KaTeX display mode) and `<!-- \( \) -->` (KaTeX inline mode)

Before

<img alt="KaTeX display in HTML comment without extension." src="https://raw.githubusercontent.com/timothycohen/samplekit/main/packages/preprocess-katex-vscode/static/demo-comment-katex-before.png" width="300" />

After

<img alt="KaTeX display in HTML comment with extension." src="https://raw.githubusercontent.com/timothycohen/samplekit/main/packages/preprocess-katex-vscode/static/demo-comment-katex.png" width="300" />

## JS/TS Template Literals

A tagged template literal is used to inject KaTeX highlighting into JS.

#### <code>katex\`</code> or <code>latex\`</code> (case insensitive)

Before

<img alt="KaTeX in template literal without extension." src="https://raw.githubusercontent.com/timothycohen/samplekit/main/packages/preprocess-katex-vscode/static/demo-template-katex-before.png" width="300" />

After

<img alt="KaTeX in template literal with extension." src="https://raw.githubusercontent.com/timothycohen/samplekit/main/packages/preprocess-katex-vscode/static/demo-template-katex.png" width="300" />

## Extension

> [VSCode Marketplace](https://marketplace.visualstudio.com/items?itemName=samplekit.svelte-pp-katex)
