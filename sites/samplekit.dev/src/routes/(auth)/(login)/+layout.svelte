<script lang="ts">
	interface Props { children?: import('svelte').Snippet }

	let { children }: Props = $props();
	import { Turnstile, createTurnstileService, useTurnstileService } from '$lib/botProtection/turnstile/client';
	import { Logo } from '$lib/components';
	import { DotPattern } from '$routes/(auth)/(login)/components';

	createTurnstileService();
	const { turnstile } = useTurnstileService();
</script>

<section class="my-5-12 grid place-items-center page">
	<div class="relative flex w-full max-w-md justify-center md:max-w-lg">
		<div class="absolute -left-20 -top-20 hidden h-56 w-56 text-accent-7 sm:block">
			<DotPattern pattern={{ id: 'dots-a', transform: 'scale(0.6) rotate(0)' }} />
		</div>
		<div class="absolute -bottom-20 -right-20 hidden h-28 w-28 text-accent-6 sm:block">
			<DotPattern pattern={{ id: 'dots-b', transform: 'scale(0.5) rotate(0)' }} />
		</div>

		<div class="relative flex w-full flex-col rounded-card sm:p-12 sm:pb-3 sm:shadow-4">
			<div class="absolute inset-0 rounded-card backdrop-blur-sm"></div>

			<div class="z-10">
				<div class="mb-8 flex items-center justify-center overflow-hidden text-3xl">
					<Logo link />
				</div>

				{@render children?.()}

				<div class="mb-4 mt-2 h-[65px] w-full">
					<Turnstile {turnstile} />
				</div>

				<noscript>
					<div class="alert-wrapper alert-wrapper-warning mt-6">Please enable JavaScript to continue.</div>
				</noscript>
				<div class="text-center text-sm text-gray-11">This is a demo site. The database is reset every 24 hours.</div>
			</div>
		</div>
	</div>
</section>
