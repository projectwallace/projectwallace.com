<script lang="ts">
	import Empty from '$lib/components/Empty.svelte'
	import Hunk from './CssDiffHunk.svelte'
	import DiffStat from './DiffStat.svelte'
	import { diff_css, type StructuredPatch } from '$lib/diff-css'

	interface Props {
		old_css?: string
		new_css?: string
	}

	let { old_css = ``, new_css = '' }: Props = $props()

	let patch = $derived.by<StructuredPatch | undefined>(() => {
		if (old_css.length > 0 && new_css.length > 0) {
			return diff_css(old_css, new_css)
		}
	})
</script>

{#if patch !== undefined}
	{#if patch.hunks.length === 0}
		<div data-testid="no-diff-detected">
			<Empty>No changes detected</Empty>
		</div>
	{:else}
		<DiffStat additions={patch.lines_added} deletions={patch.lines_removed} />

		<div class="wrapper">
			{#each patch.hunks as hunk}
				<Hunk {hunk} />
			{/each}
		</div>
	{/if}
{/if}

<style>
	.wrapper {
		display: grid;
		gap: var(--space-1);
		margin-top: var(--space-4);
		overflow-x: auto;
	}
</style>
