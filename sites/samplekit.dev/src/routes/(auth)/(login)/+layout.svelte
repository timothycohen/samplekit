<script lang="ts">
	import { Turnstile, createTurnstileService, useTurnstileService } from '$lib/botProtection/turnstile/client';
	import { Admonition, Logo } from '$lib/components';
	import { DotPattern } from '$routes/(auth)/(login)/components';

	const { children } = $props();

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

				{@render children()}

				<div class="mb-4 mt-2 h-[65px] w-full">
					<Turnstile {turnstile} />
				</div>

				<noscript>
					<Admonition bold kind="security" title="JS Required">
						Enable JavaScript to continue with email / password.
					</Admonition>
				</noscript>
				<div class="text-center text-sm text-gray-11">This is a demo site. The database is reset every 24 hours.</div>
			</div>
		</div>
	</div>
</section>
