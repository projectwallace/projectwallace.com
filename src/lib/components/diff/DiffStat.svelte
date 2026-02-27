<script lang="ts">
	import { diffstat_blocks, EMPTY, ADDED, DELETED } from './diffstat-blocks'
	type Props = {
		additions: number
		deletions: number
	}

	let { additions, deletions }: Props = $props()

	let total = $derived(deletions + additions)
	let squares = $derived<Uint8Array>(diffstat_blocks(additions, deletions))
</script>

{#snippet icon()}
	<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 20 20">
		<style>
			.stripe-1 {
				fill: var(--wallace-diffstat-fg);
			}
			.stripe-2 {
				fill: var(--wallace-diffstat-bg);
			}
		</style>
		<defs>
			<pattern id="stripes-b" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
				<rect width="3" height="6" class="stripe-1" />
				<rect x="3" width="6" height="6" class="stripe-2" />
			</pattern>
		</defs>
		<rect width="20" height="20" fill="url(#stripes-b)" />
	</svg>
{/snippet}

<div data-testid="diffstat">
	<span class="squares" aria-hidden="true">
		{#each squares as square}
			<i
				class={[
					'square',
					{
						added: square === ADDED,
						deleted: square === DELETED,
						empty: square === EMPTY
					}
				]}
			>
				<!-- Some sensible content in case CSS doesn't work. Hiding it with `font-size: 0;` -->
				{#if square === ADDED}
					+
				{:else if square === DELETED}
					{@render icon()}
				{:else if square === EMPTY}
					⬜
				{/if}
			</i>
		{/each}
	</span>
	<span>
		<b>{total} changes</b>
		with
		<b>{additions} additions</b>
		and
		<b>{deletions} deletions</b>.
	</span>
</div>

<style>
	.squares {
		display: inline-flex;
		gap: var(--space-1);
	}

	.square {
		display: inline-block;
		inline-size: var(--space-3);
		block-size: var(--space-3);
		font-size: 0;
		overflow: clip;
		--wallace-diffstat-fg: transparent;

		@media print, (forced-colors: active) {
			border: 1px solid;
		}

		&.added {
			background-color: var(--success-400);
		}

		&.deleted {
			background-color: var(--error-400);
			--wallace-diffstat-bg: var(--error-200);

			@media (prefers-contrast: more) {
				--wallace-diffstat-bg: var(--error-100);
			}
		}

		&.empty {
			background-color: var(--bg-400);
		}
	}
</style>
