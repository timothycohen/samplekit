<script lang="ts">
	import { LogoIcon } from '$lib/components';
	import I from '$lib/icons';
</script>

<div class="prose prose-radix h-full bg-app-bg p-4">
	<div class="flex items-center justify-between">
		<div class="flex gap-3">
			<I.Menu class="h-5 w-5" />
			<I.SwatchBook class="h-5 w-5" />
		</div>
		<div class="font-serif text-lg font-medium">Svelte Preprocessors</div>
		<div class="flex gap-3">
			<LogoIcon svgClasses="h-5 w-5" />
			<I.GitHub class="h-5 w-5" />
		</div>
	</div>
	<div>
		<p>When you need to write some math:</p>

		<!-- \[ \ddot u = c^2 \nabla^2 u \] -->

		<p>Or maybe some code:</p>

		<!-- shiki-start
p c"no-lines" d"theme=daffodil"
s"Ishmael" d"highlight"
```ts
const callMe = "Ishmael";
```
shiki-end -->

		<!-- md-start
| NPM Package         | VS Code Extension  |
| ------------------- | ------------------ |
| preprocess-katex    | svelte-pp-katex    |
| preprocess-markdown | svelte-pp-markdown |
| preprocess-shiki    | svelte-pp-shiki    |
md-end -->

		<p>There's a Svelte preprocessor for that!</p>
	</div>
</div>
