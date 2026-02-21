import { onMount } from 'svelte'

/**
 * Deferred rendering utility for Svelte 5.
 * Waits until the component is mounted and painted before setting `ready` to true.
 *
 * @example
 * ```svelte
 * <script>
 *   import { Deferred } from '$lib/deferred.svelte'
 *   let deferred = new Deferred()
 * </script>
 *
 * <CriticalContent />
 * {#if deferred.ready}
 *   <DeferredContent />
 * {/if}
 * ```
 */
export class Deferred {
	ready = $state(false)

	constructor() {
		onMount(() => {
			// Double rAF ensures the browser has:
			// 1. Computed styles and layout (first rAF)
			// 2. Actually painted to screen (second rAF)
			requestAnimationFrame(() => {
				requestAnimationFrame(() => {
					this.ready = true
				})
			})
		})
	}
}
