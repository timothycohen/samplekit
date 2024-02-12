<script lang="ts">
	import { Turnstile, createTurnstileService, useTurnstileService } from '$lib/botProtection/turnstile/client';
	import { Logo } from '$lib/components';
	import { DotPattern } from '$routes/(auth)/(login)/components';

	createTurnstileService();
	const { turnstile } = useTurnstileService();
</script>

<section class="page my-5-12 grid place-items-center">
	<div class="relative flex w-full max-w-md justify-center md:max-w-lg">
		<div class="text-accent-7 absolute -left-20 -top-20 hidden h-56 w-56 sm:block">
			<DotPattern pattern={{ id: 'dots-a', transform: 'scale(0.6) rotate(0)' }} />
		</div>
		<div class="text-accent-6 absolute -bottom-20 -right-20 hidden h-28 w-28 sm:block">
			<DotPattern pattern={{ id: 'dots-b', transform: 'scale(0.5) rotate(0)' }} />
		</div>

		<div class="rounded-card sm:shadow-4 relative flex w-full flex-col sm:p-12 sm:pb-3">
			<div class="rounded-card absolute inset-0 backdrop-blur-sm" />

			<div class="z-10">
				<div class="mb-8 flex items-center justify-center overflow-hidden text-3xl">
					<Logo link />
				</div>

				<slot />

				<div class="mb-4 mt-2 h-[65px] w-full">
					<Turnstile {turnstile} />
				</div>

				<noscript>
					<div class="alert-wrapper alert-wrapper-warning mt-6">Please enable JavaScript to continue.</div>
				</noscript>
				<div class="text-gray-11 text-center text-sm">This is a demo site. The database is reset every 24 hours.</div>
			</div>
		</div>
	</div>
</section>
