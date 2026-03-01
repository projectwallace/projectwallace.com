<script lang="ts">
	import { createTabs, melt } from '@melt-ui/svelte'
	import type { Snippet } from 'svelte'
	const {
		states: { value },
		elements: { root, list, content: tab_content, trigger }
	} = createTabs({
		loop: false,
		defaultValue: 'url'
	})

	type Props = {
		url_tab: Snippet
		file_tab: Snippet
		raw_tab: Snippet
	}
	let { url_tab, file_tab, raw_tab }: Props = $props()
</script>

<div class="input-mode-switcher">
	<div use:melt={$root}>
		<div use:melt={$list}>
			<button use:melt={$trigger('url')}>URL</button>
			<button use:melt={$trigger('file')}>File(s)</button>
			<button use:melt={$trigger('raw')}>Paste CSS</button>
		</div>
	</div>

	<div use:melt={$tab_content('url')}>
		{#if $value === 'url'}
			{@render url_tab()}
		{/if}
	</div>

	<div use:melt={$tab_content('file')}>
		{#if $value === 'file'}
			{@render file_tab()}
		{/if}
	</div>

	<div use:melt={$tab_content('raw')}>
		{#if $value === 'raw'}
			{@render raw_tab()}
		{/if}
	</div>
</div>

<style>
	.input-mode-switcher {
		display: grid;
		gap: var(--space-3);
		--_input-mode-switcher-spacing: 0.25rem;
	}

	[role='tablist'] {
		display: flex;
		gap: var(--_input-mode-switcher-spacing);
		border: 1px solid var(--fg-600);
		margin-inline: auto;
		padding: var(--_input-mode-switcher-spacing);
		max-width: max-content;
	}

	[role='tab'] {
		display: block;
		padding: 0 var(--space-2);
		font-weight: var(--font-medium);
		color: var(--fg-300);
		font-size: var(--size-sm);
	}

	[role='tab'][data-state='active'] {
		background-color: var(--bg-200);
		color: var(--fg-100);
	}

	[role='tab']:not([data-state='active']):hover {
		background-color: var(--bg-100);
		color: var(--fg-200);
	}
</style>
