<script lang="ts">
	import { Panel, Header } from '$components/Panel/index'
	import Empty from '$components/Empty.svelte'
	import Table from '$components/Table.svelte'
	import Heading from '$components/Heading.svelte'
	import DefinitionList from '$lib/components/stats/DefinitionList.svelte'
	import { descriptors } from '$lib/font-face-descriptors'
	import type { CssAnalysis } from '$lib/analyze-css'
	import { create_keyboard_list, type OnChange } from '$components/use-keyboard-list.svelte'
	import { get_css_state } from '$lib/css-state.svelte'
	import { hash } from '$lib/hash'
	import { string_sort } from '$lib/string-sort'
	import type { Location } from '@projectwallace/css-analyzer'

	let css_state = get_css_state()
	let selected_item = $derived(css_state.selected_item)
	let {
		elements: { root, item }
	} = create_keyboard_list()

	type FontFaces = CssAnalysis['atrules']['fontface']

	let {
		total = 0,
		totalUnique = 0,
		uniquenessRatio = 0,
		unique = [],
		uniqueWithLocations = Object.create(null)
	}: Pick<FontFaces, 'total' | 'totalUnique' | 'uniquenessRatio' | 'unique' | 'uniqueWithLocations'> = $props()

	const font_style = 'font-style'
	const font_weight = 'font-weight'
	const font_family = 'font-family'
	const default_descriptors = [font_family, font_weight, font_style]
	const required_descriptors = [font_family, 'src']

	function normalize_font_weight(weight: string | undefined): number {
		if (weight === undefined) return 400
		if (weight === 'normal') return 400
		if (weight === 'bold') return 700
		if (weight === 'lighter') return 100
		if (weight === 'bolder') return 700

		let parsed = parseInt(weight, 10)
		if (Number.isFinite(parsed)) return parsed
		return 0
	}

	let sorted = $derived.by(() => {
		let items = Uint8Array.from({ length: totalUnique }, (_, i) => i)
		// sort by family -> weight -> style
		items.sort((_a: number, _b: number) => {
			let a = unique[_a]
			let b = unique[_b]
			let a_family = font_family in a ? a[font_family] : ''
			let b_family = font_family in b ? b[font_family] : ''
			let a_weight = normalize_font_weight(a[font_weight])
			let b_weight = normalize_font_weight(b[font_weight])
			let a_style = font_style in a ? a[font_style] : ''
			let b_style = font_style in b ? b[font_style] : ''

			if (a_family !== b_family) {
				return string_sort(a_family || '', b_family || '')
			}

			if (a_weight !== b_weight) {
				return a_weight - b_weight
			}

			return string_sort(a_style, b_style)
		})

		return items
	})

	let extra_descriptors = $derived.by(() => {
		let items = new Set<string>()
		for (let rule_index of sorted) {
			let rule = unique[rule_index]
			for (let property in rule) {
				if (!default_descriptors.includes(property) && property !== 'src') {
					items.add(property)
				}
			}
		}
		return items
	})

	let warnings = $derived.by(() => {
		let items = new Set<string>()
		for (let rule_index of sorted) {
			let rule = unique[rule_index]
			for (let property in rule) {
				// Fill warnings on unkown descriptors
				if (!descriptors.has(property.toLowerCase())) {
					items.add(`Unexpected descriptor "${property}"`)
				}
			}
			for (let descriptor of required_descriptors) {
				if (!(descriptor in rule)) {
					items.add(`Missing descriptor "${descriptor}"`)
				}
			}
		}
		return items
	})

	function onchange({ value, active_index }: Parameters<OnChange>[0]) {
		let unique_index = sorted[active_index]
		let item = Object.entries(uniqueWithLocations!)[unique_index]
		if (item) {
			css_state.select_item({
				type: 'font-face',
				node_type: 'atrule',
				value,
				locations: item[1] as Location[]
			})
		}
	}
</script>

<div class="report-section-full-width">
	<Panel id="font-face">
		<Header>
			<Heading element="h3">@font-face</Heading>
			{#if total > 0}
				<DefinitionList
					stats={[
						{ name: 'Total', value: total },
						{ name: 'Unique', value: totalUnique, ratio: uniquenessRatio }
					]}
				/>
			{/if}
		</Header>
		{#if total > 0}
			<Table>
				<thead>
					<tr>
						{#each default_descriptors as property}
							<th>
								<code class="specimen">{property}</code>
							</th>
						{/each}
						{#each extra_descriptors as property}
							<th>
								<code class="specimen descriptor" class:valid={descriptors.has(property)}>{property}</code>
							</th>
						{/each}
						<th>
							<code>src</code>
						</th>
					</tr>
				</thead>
				<tbody use:root={{ onchange }}>
					{#each sorted as rule_index}
						{@const rule = unique[rule_index]}
						{@const value = hash(
							(rule['src'] || '') +
								(rule['font-family'] || '') +
								(rule['font-weight'] || '') +
								(rule['font-style'] || '') +
								(rule['unicode-range'] || '')
						)}
						{@const selected = value === selected_item?.value && selected_item.type === 'font-face'}
						<tr class:active={selected} use:item={{ value }}>
							{#each default_descriptors.concat(Array.from(extra_descriptors)) as property}
								<td>
									{#if property in rule}
										<code
											style:font-style={property === font_style ? rule[property] : undefined}
											style:font-weight={property === font_weight ? rule[property] : undefined}
											class="specimen"
										>
											{rule[property]}
										</code>
									{/if}
								</td>
							{/each}
							<td class="descriptor" class:valid={'src' in rule}>
								{#if 'src' in rule}
									<code class="specimen">
										{rule['src']}
									</code>
								{:else}
									<i>(not set)</i>
								{/if}
							</td>
						</tr>
					{/each}
				</tbody>
			</Table>
			{#if warnings.size > 0}
				<ul class="warnings">
					{#each warnings as warning}
						<li class="warning">{warning}</li>
					{/each}
				</ul>
			{/if}
		{:else}
			<Empty>No @font-face found.</Empty>
		{/if}
	</Panel>
</div>

<style>
	tbody tr {
		cursor: pointer;
	}

	tr.active {
		background-color: var(--gray-500);
		outline: 1px solid var(--teal-400);
		outline-offset: -1px;
	}

	th,
	td {
		overflow: hidden;
	}

	td {
		position: relative;
		max-width: 25cqi;
	}

	code {
		white-space: nowrap;
		display: inline-block;
		vertical-align: middle;
		overflow: hidden;
		text-overflow: ellipsis;
		width: 100%;
	}

	.descriptor:not(.valid) {
		text-decoration: var(--yellow-400) wavy underline;

		tr:has(&) td:first-child code {
			text-decoration: var(--yellow-400) wavy underline;
		}
	}

	.warnings {
		margin-top: var(--space-4);
		padding-left: var(--space-6);
		list-style-type: disc;
		list-style-position: outside;
		text-decoration: var(--yellow-400) wavy underline;
	}
</style>
