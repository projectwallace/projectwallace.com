<script lang="ts">
	import type { CssLocation } from '$lib/css-location'
	import FilterGroup from '$lib/components/FilterGroup.svelte'
	import FilterOption from '$components/FilterOption.svelte'
	import { get_css_state } from '$lib/css-state.svelte'
	import { IsInViewport } from 'runed'
	import { string_sort } from '$lib/string-sort'

	let css_state = get_css_state()
	let selected_item = $derived(css_state.selected_item)
	let wrapper = $state<HTMLElement | undefined>(undefined)
	let is_in_viewport = new IsInViewport(() => wrapper, { rootMargin: '100px' })

	interface Props {
		items?: Record<string, CssLocation[]>
	}

	let { items = Object.create(null) }: Props = $props()

	let sorting: 'as-authored' | 'by-count' | 'alphabetical' = $state('as-authored')
	let values = $derived(Object.entries(items))

	let sorted = $derived.by(() => {
		switch (sorting) {
			case 'as-authored':
				return values
			case 'by-count':
				return values.slice().sort((a, b) => b[1].length - a[1].length)
			case 'alphabetical':
				return values.slice().sort((a, b) => string_sort(a[0], b[0]))
		}
	})
</script>

<div class="grid gap-4">
	<FilterGroup>
		<legend class="sr-only">Sorting box-shadows</legend>
		<FilterOption bind:group={sorting} name="gradient-sorting" value="as-authored">Sort by source order</FilterOption>
		<FilterOption bind:group={sorting} name="gradient-sorting" value="by-count">Sort by count</FilterOption>
		<FilterOption bind:group={sorting} name="gradient-sorting" value="alphabetical">Sort A-Z</FilterOption>
	</FilterGroup>

	<ol class="list" data-testid="gradient-list" bind:this={wrapper}>
		{#each sorted as [value, locations]}
			<li
				class="item shadow [ coverable ]"
				class:active={value === selected_item?.value && selected_item.type === 'gradient'}
			>
				{#if is_in_viewport.current === true}
					<div class="gradient" style:--gradient={value}>{locations.length}&times;</div>
				{:else}
					<div class="gradient">{locations.length}&times;</div>
				{/if}
				<code class="code">{value}</code>
				<button
					class="coverable-link"
					onclick={(event) => {
						event.preventDefault()
						css_state.select_item({
							type: 'gradient',
							node_type: 'value',
							value,
							locations
						})
					}}
				>
					<span class="sr-only">
						Show usage for <code>{value}</code>
					</span>
				</button>
			</li>
		{/each}
	</ol>
</div>

<style>
	.list {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
		gap: var(--space-4);
		align-items: start;
		margin-block-start: var(--space-4);
	}

	.item {
		position: relative;
	}

	.active::after {
		border: 1px solid var(--accent);
		content: '';
		position: absolute;
		inset: 0;
	}

	.gradient {
		position: relative;
		height: var(--space-32);
		padding: var(--space-2);
		text-shadow: 0 0.05rem 0.05rem var(--black);
		color: var(--fg-100);
		font-weight: var(--font-bold);
		contain: strict;
	}

	.gradient::before {
		content: '';
		position: absolute;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		z-index: -1;
		background-image: var(--gradient, linear-gradient(0deg, transparent, transparent));
	}

	@media print {
		.list {
			grid-template-columns: minmax(0, 1fr);
			gap: var(--space-1);
		}

		.item {
			border: 1px solid;
			display: grid;
			grid-template-columns: 4rem minmax(0, 1fr);
			align-items: center;
		}

		.gradient {
			height: auto;
			padding: 0 var(--space-2);
			font-weight: var(--font-normal);
		}

		.gradient::before {
			display: none;
		}
	}

	.code {
		position: relative;
		display: block;
		padding: var(--space-1) var(--space-2);
		font-size: smaller;
		background-color: var(--bg-400);
		color: var(--fg-200);
		word-break: break-word;
	}
</style>
