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
				<!-- Some sensible content in case CSS doesn't work -->
				{#if square === ADDED}
					🟩
				{:else if square === DELETED}
					🟥
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
		width: var(--space-3);
		height: var(--space-3);
		font-size: 0;

		&.added {
			background-color: var(--success-400);
		}

		&.deleted {
			background-color: var(--error-400);
		}

		&.empty {
			background-color: var(--gray-450);
		}
	}
</style>
