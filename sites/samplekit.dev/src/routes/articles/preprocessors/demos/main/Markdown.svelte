<script lang="ts">
	import Layout from './Layout.svelte';
</script>

<Layout title="Preprocessing Markdown">
	{#snippet write()}
		<div class="not-prose">
			<!-- shiki-start
t-md-block
```md
| Heading 1 | Heading 2 | Heading 3 |
| --------- | --------- | --------- |
| cell 1    | cell 2    | cell 3    |
| cell 4    | cell 5    | cell 6    |
```
shiki-end -->
		</div>
	{/snippet}

	{#snippet process()}
		<div class="not-prose">
			<!-- shiki-start
```html
<table>
	<thead>
		<tr>
		<th>Heading 1</th>
		<th>Heading 2</th>
		<th>Heading 3</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td>cell 1</td>
			<td>cell 2</td>
			<td>cell 3</td>
		</tr>
		<tr>
			<td>cell 4</td>
			<td>cell 5</td>
			<td>cell 6</td>
		</tr>
	</tbody>
</table>
```
shiki-end -->
		</div>
	{/snippet}

	{#snippet render()}
		<div class="bg-code px-8">
			<!-- md-start
| Heading 1 | Heading 2 | Heading 3 |
| --------- | --------- | --------- |
| cell 1    | cell 2    | cell 3    |
| cell 4    | cell 5    | cell 6    |
md-end -->
		</div>
	{/snippet}
</Layout>
