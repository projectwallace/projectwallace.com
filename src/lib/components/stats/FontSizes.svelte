<script lang="ts">
	import { tick } from 'svelte'
	import { SvelteMap } from 'svelte/reactivity'
	import type { CssLocation } from '$lib/css-location'
	import FilterGroup from '$lib/components/FilterGroup.svelte'
	import FilterOption from '$components/FilterOption.svelte'
	import { get_css_state } from '$lib/css-state.svelte'
	import { string_sort } from '$lib/string-sort'

	let css_state = get_css_state()
	let selected_item = $derived(css_state.selected_item)
	let calculated_sizes = new SvelteMap<string, number>()

	interface Props {
		sizes?: Record<string, CssLocation[]>
		limit?: number
	}

	let { sizes = Object.create(null), limit = 30 }: Props = $props()

	let sorting = $state('by-source-order')
	let sorted = $state(Object.entries(sizes))

	$effect(() => {
		if (sorting === 'by-size') {
			limit = Infinity
			tick().then(() => {
				sorted = Object.entries(sizes).sort((a, b) => {
					let a_size = calculated_sizes.get(a[0]) ?? 0
					let b_size = calculated_sizes.get(b[0]) ?? 0
					return b_size - a_size
				})
			})
			return
		}
		if (sorting === 'by-count') {
			sorted = Object.entries(sizes).sort((a, b) => b[1].length - a[1].length)
			return
		}
		if (sorting === 'alphabetical') {
			sorted = Object.entries(sizes).sort((a, b) => string_sort(a[0], b[0]))
			return
		}
		sorted = Object.entries(sizes)
	})

	function element_size(node: HTMLDivElement, callback: (size: number) => void) {
		let computed_size = window.getComputedStyle(node).fontSize
		callback(parseFloat(computed_size))
	}
</script>

<FilterGroup>
	<legend class="sr-only">Sorting font-sizes</legend>
	<FilterOption name="font-size-sorting" value="by-source-order" bind:group={sorting}>
		Sort by source order
	</FilterOption>
	<FilterOption name="font-size-sorting" value="by-size" bind:group={sorting}>Sort by size</FilterOption>
	<FilterOption name="font-size-sorting" value="by-count" bind:group={sorting}>Sort by count</FilterOption>
	<FilterOption name="font-size-sorting" value="alphabetical" bind:group={sorting}>Sort A-Z</FilterOption>
</FilterGroup>

<ul class="sizes">
	{#each sorted as [value, locations] (value)}
		<li
			class={[
				'size coverable',
				{
					active: selected_item?.value === value && selected_item.type === 'font-size'
				}
			]}
		>
			<button
				class="coverable-link"
				onclick={(event) => {
					event.preventDefault()
					css_state.select_item({
						type: 'font-size',
						node_type: 'value',
						value: value,
						locations
					})
				}}
			>
				<div
					aria-hidden="true"
					class="example"
					style:font-size={value}
					use:element_size={(calculated_size) => {
						calculated_sizes.set(value, calculated_size)
					}}
				>
					AaBb
				</div>
				<code class="specimen">{value}</code>
				{locations.length}&times;
			</button>
		</li>
	{/each}
</ul>

<style>
	.sizes {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
		margin-top: var(--space-2);
		align-items: end;
		overflow: hidden;
		container-type: inline-size;
	}

	.size {
		border: 1px solid var(--fg-500);
		display: flex;
		flex-direction: column;
		text-align: center;

		&.active {
			border-color: var(--accent);
		}
	}

	.example {
		color: var(--fg-300);
		font-weight: var(--font-medium);
		line-height: 1.25;
		align-self: center;
		padding: var(--space-2);
	}

	code {
		display: block;
		border-block-width: 1px;
		border-style: solid;
		border-color: var(--fg-600);
		padding-block: var(--space-1);
		padding-inline: var(--space-1);
	}
</style>
