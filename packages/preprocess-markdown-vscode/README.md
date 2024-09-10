# Markdown TextMate Grammar Injection into Svelte Templates

Accompanies the @samplekit/preprocess-katex npm package to inject syntax highlighting into the Svelte template markdown blocks.

## Features

- injects Markdown highlighting into HTML comments inside Svelte markup.
- adds snippets to make it quicker to generate the required HTML comments.

## Svelte HTML Comments

By using HTML comments, it's trivial to write a preprocessor without running afoul of svelte check, prettier, eslint, typescript, etc.

#### `<!-- md-start md-end -->`

Before

<img alt="Markdown in HTML comment without extension." src="https://raw.githubusercontent.com/timothycohen/samplekit/main/packages/preprocess-markdown-vscode/static/demo-comment-md-before.png" width="300" />

After

<img alt="Markdown in HTML comment with extension." src="https://raw.githubusercontent.com/timothycohen/samplekit/main/packages/preprocess-markdown-vscode/static/demo-comment-md.png" width="300" />

## Extension

> [VSCode Marketplace](https://marketplace.visualstudio.com/items?itemName=samplekit.svelte-pp-markdown)
