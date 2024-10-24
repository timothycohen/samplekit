<script lang="ts">
	import { Robot } from '$routes/(auth)';
</script>

<section class="grid h-screen-nav max-h-screen place-content-center gap-10 md:grid-cols-2 md:gap-20">
	<div class="flex justify-center"><Robot class="h-40 max-h-96 drop-shadow-2xl md:h-full" /></div>
	<div class="flex items-center">
		<div>
			<h1 class="mb-10 text-4xl font-medium underline decoration-error-9 decoration-wavy underline-offset-8">Oops!</h1>
			<p class="mb-6 text-lg">That verification code is no long valid.</p>
		</div>
	</div>
</section>
