<script lang="ts">
	import After from './After.pp.svelte';
	import Before from './Before.svelte';
	import MockupPhone from './MockupPhone.svelte';
	import MockupVsCode from './MockupVSCode.svelte';
</script>

<div class="flex-row items-center gap-8 space-y-12 min-[880px]:flex min-[880px]:space-y-0">
	<div class="mx-auto max-w-fit dark" data-theme="amethyst">
		<MockupVsCode filename="samplekit | sites/preprocessor-docs">
			<div class="before-demo mx-auto h-full text-sm"><Before /></div>
		</MockupVsCode>
	</div>

	<a href="https://preprocessors.samplekit.dev" class="btn btn-accent hidden h-fit w-fit shadow-3 min-[1080px]:block">
		Preprocessor Docs
	</a>

	<div class="light mx-auto w-[352px] max-w-fit" data-theme="daffodil">
		<MockupPhone>
			<After />
		</MockupPhone>
	</div>
</div>

<a
	href="https://preprocessors.samplekit.dev"
	class="btn btn-accent mx-auto mt-12 h-fit w-full shadow-3 min-[1080px]:hidden"
>
	Preprocessor Docs
</a>

<style lang="postcss">
	:global(.before-demo pre),
	:global(.before-demo code) {
		margin: 0 !important;
		border: none !important;
		border-top-left-radius: 0 !important;
		border-top-right-radius: 0 !important;
		height: 100%;
	}
</style>
