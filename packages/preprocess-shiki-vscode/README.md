# Codeblock TextMate Grammar Injection into Svelte Templates

Accompanies the @samplekit/preprocess-shiki npm package to inject syntax highlighting into the Svelte template code blocks.

## Features

- injects code highlighting into HTML comments inside Svelte markup.
- adds snippets to make it quicker to generate the required HTML comments.

## Svelte HTML Comments

By using HTML comments, it's trivial to write a preprocessor without running afoul of svelte check, prettier, eslint, typescript, etc.

#### `<!-- shiki-start shiki-end -->`

Before

<img alt="Codeblock in HTML comment without extension." src="https://raw.githubusercontent.com/timothycohen/samplekit/main/packages/preprocess-shiki-vscode/static/demo-comment-code-before.png" width="300" />

After

<img alt="Codeblock in HTML comment with extension." src="https://raw.githubusercontent.com/timothycohen/samplekit/main/packages/preprocess-shiki-vscode/static/demo-comment-code.png" width="300" />

## Extension

> [VSCode Marketplace](https://marketplace.visualstudio.com/items?itemName=samplekit.svelte-pp-shiki)
