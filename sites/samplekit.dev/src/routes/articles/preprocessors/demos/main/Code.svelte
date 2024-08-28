<script lang="ts">
	import Layout from './Layout.svelte';
</script>

<Layout title="Preprocessing Code Decoration">
	{#snippet write()}
		<div class="not-prose">
			<!-- shiki-start
t-shiki-block
~~~md
l"2" d"highlight"
s"hello" c"underline"
```ts
console.log('hello world');
const highlightedLine = true;
```
~~~
shiki-end -->
		</div>
	{/snippet}

	{#snippet process()}
		<div class="not-prose">
			<!-- shiki-start
s#"data-line-highlight="""# d"highlight"
s#"class="underline""# d"highlight"
```html
<pre style="--h-daffodil:#575279;--h-dark:#D4D4D4;--h-bellflower:#4c4f69;--h-daffodil-bg:#faf4ed;--h-dark-bg:#000;--h-bellflower-bg:#eff1f5" data-shiki="" data-shiki-lang-ts="" data-shiki-t-block="">
	<code>
		<span data-line="">
			<span style="--h-daffodil:#575279;--h-dark:#9CDCFE;--h-bellflower:#4C4F69;--h-daffodil-font-style:italic;--h-dark-font-style:inherit;--h-bellflower-font-style:inherit">console</span>
			<span style="--h-daffodil:#286983;--h-dark:#D4D4D4;--h-bellflower:#179299">.</span>
			<span style="--h-daffodil:#D7827E;--h-dark:#DCDCAA;--h-bellflower:#1E66F5;--h-daffodil-font-style:inherit;--h-dark-font-style:inherit;--h-bellflower-font-style:italic">log</span>
			<span style="--h-daffodil:#575279;--h-dark:#D4D4D4;--h-bellflower:#4C4F69">(</span>
			<span style="--h-daffodil:#EA9D34;--h-dark:#CE9178;--h-bellflower:#40A02B">'</span>
			<span style="--h-daffodil:#EA9D34;--h-dark:#CE9178;--h-bellflower:#40A02B" class="underline">hello</span>
			<span style="--h-daffodil:#EA9D34;--h-dark:#CE9178;--h-bellflower:#40A02B"> world'</span>
			<span style="--h-daffodil:#575279;--h-dark:#D4D4D4;--h-bellflower:#4C4F69">)</span>
			<span style="--h-daffodil:#797593;--h-dark:#D4D4D4;--h-bellflower:#7C7F93">;</span>
		</span>
		<span data-line="" data-line-highlight="">
			<span style="--h-daffodil:#286983;--h-dark:#569CD6;--h-bellflower:#8839EF;--h-daffodil-font-style:inherit;--h-dark-font-style:italic;--h-bellflower-font-style:inherit">const</span>
			<span style="--h-daffodil:#575279;--h-dark:#4FC1FF;--h-bellflower:#4C4F69;--h-daffodil-font-style:italic;--h-dark-font-style:inherit;--h-bellflower-font-style:inherit"> highlightedLine</span>
			<span style="--h-daffodil:#286983;--h-dark:#D4D4D4;--h-bellflower:#179299"> =</span>
			<span style="--h-daffodil:#D7827E;--h-dark:#569CD6;--h-bellflower:#FE640B;--h-daffodil-font-style:inherit;--h-dark-font-style:italic;--h-bellflower-font-style:inherit"> true</span>
			<span style="--h-daffodil:#797593;--h-dark:#D4D4D4;--h-bellflower:#7C7F93">;</span>
		</span>
	</code>
</pre>
```
shiki-end -->
		</div>
	{/snippet}

	{#snippet render()}
		<div class="not-prose">
			<!-- shiki-start
l"2" d"highlight"
s"hello" c"underline"
```ts
console.log('hello world');
const highlightedLine = true;
```
shiki-end -->
		</div>
	{/snippet}
</Layout>
