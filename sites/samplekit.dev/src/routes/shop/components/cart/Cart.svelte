<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import { windowEscape } from '$lib/actions';
	import { Notice } from '$lib/components';
	import { ShoppingCartIcon, X } from '$lib/styles/icons';
	import { RemoveFromCartBtn } from '$routes/shop/components';
	import { useCartCtx } from '$routes/shop/services';
	import { DEFAULT_SELECTED_OPTION, formatPrice } from '$routes/shop/utils';
	import EditItemQuantityBtn from './EditItemQuantityBtn.svelte';

	const cart = useCartCtx();
</script>

{#if cart.drawer}
	<div
		aria-hidden="true"
		onclick={() => (cart.drawer = false)}
		class="fixed inset-0 z-50 bg-black/50"
		transition:fade={{ duration: 150 }}
		use:windowEscape={() => (cart.drawer = false)}
	></div>

	<div
		role="dialog"
		aria-modal="true"
		class="fixed right-0 top-0 z-50 h-screen w-full bg-app-bg p-6 shadow-5 focus:outline-none sm:max-w-screen-xs"
		transition:fly={{ x: 350, duration: 300, opacity: 1 }}
	>
		<div class="flex h-full flex-col">
			<div class="flex items-center justify-between">
				<p class="text-lg font-semibold">My Cart</p>

				<button
					type="button"
					aria-label="Close"
					class="btn-ghost grid h-6 w-6 place-content-center"
					onclick={() => (cart.drawer = false)}
				>
					<X />
				</button>
			</div>

			{#if !cart.value || cart.value.lines.length === 0}
				<div class="mt-20 flex w-full flex-col items-center justify-center overflow-hidden">
					<ShoppingCartIcon class="h-16" />
					<p class="mt-6 text-center text-2xl font-bold">Your cart is empty.</p>
				</div>
			{:else}
				<div class="mt-4 h-full overflow-y-auto">
					<div class="flex w-full flex-col items-center justify-center overflow-y-auto">
						<ul class="w-full">
							{#each cart.value.lines as line, i (i)}
								{@const image = line.merchandise.product.images[0]}
								<li class="flex w-full flex-col border-b border-gray-6">
									<div class="relative flex w-full flex-row justify-between px-1 py-4">
										<div class="absolute z-40 -mt-2 ml-14">
											<RemoveFromCartBtn props={{ lineId: line.id }} />
										</div>
										<a href={line.path} onclick={() => (cart.drawer = false)} class="z-30 flex flex-row space-x-4">
											<div class="rounded-md relative h-16 w-16 cursor-pointer overflow-hidden border border-gray-6">
												{#if image}
													<img
														class="h-full w-full object-cover"
														width={64}
														height={64}
														alt={image.altText || line.merchandise.product.title}
														src={image.url}
													/>
												{/if}
											</div>

											<div class="flex flex-1 flex-col text-base">
												<span class="leading-tight">
													{line.merchandise.product.title}
												</span>
												{#if line.merchandise.title !== DEFAULT_SELECTED_OPTION}
													<p class="text-sm">
														{line.merchandise.title}
													</p>
												{/if}
											</div>
										</a>
										<div class="flex h-16 flex-col justify-between">
											<p class="flex justify-end space-y-2 text-right text-sm">
												{formatPrice(line.cost.totalAmount)}
												{line.cost.totalAmount.currencyCode}
											</p>
											<div class="ml-auto flex h-9 flex-row items-center rounded-full border border-gray-6">
												<EditItemQuantityBtn props={{ item: line, type: 'minus' }} />
												<p class="w-6 text-center">
													<span class="w-full text-sm">{line.quantity}</span>
												</p>
												<EditItemQuantityBtn props={{ item: line, type: 'plus' }} />
											</div>
										</div>
									</div>
								</li>
							{/each}
						</ul>
					</div>
				</div>

				<div>
					<div class="py-4 text-sm text-gray-11">
						<div class="mb-3 flex items-center justify-between border-b border-gray-6 pb-1 pt-1">
							<p>Taxes</p>

							<p class="text-right text-base text-gray-12">
								{formatPrice(cart.value.cost.totalTaxAmount)}
								{cart.value.cost.totalTaxAmount.currencyCode}
							</p>
						</div>
						<div class="mb-3 flex items-center justify-between border-b border-gray-6 pb-1 pt-1">
							<p>Shipping</p>
							<p class="text-right">Calculated at checkout</p>
						</div>
						<div class="mb-3 flex items-center justify-between border-b border-gray-6 pb-1 pt-1">
							<p>Total</p>
							<p class="text-right text-base text-gray-12">
								{formatPrice(cart.value.cost.totalAmount)}
								{cart.value.cost.totalAmount.currencyCode}
							</p>
						</div>
					</div>

					<Notice
						trigger={{
							text: 'Proceed to Checkout',
							classes: `btn btn-accent w-full rounded-full p-4 tracking-wide ${cart.submitting ? 'pointer-events-none' : ''}`,
						}}
						title={'Woah now, this is a demo'}
						description={'Thanks for playing along!'}
						confirm={{ text: 'Got it!' }}
					>
						<div class="space-y-3 leading-6">
							<span class="block">
								Your dynamic Shopify cart link has been created, but our demo store is deactivated and password
								protected.
							</span>
							<span class="block">If this were a real store, you'd be redirected to Shopify's checkout page.</span>
						</div>
					</Notice>
					<!-- <a
						href={$cart.checkoutUrl}
						class="btn btn-accent w-full rounded-full p-4 tracking-wide {$pending ? 'pointer-events-none' : ''}"
					>
						Proceed to Checkout
					</a>
					-->
				</div>
			{/if}
		</div>
	</div>
{/if}
