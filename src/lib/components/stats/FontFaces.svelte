<script lang="ts">
	import { Panel, Header } from '#lib/components/Panel/index.ts'
	import Empty from '#lib/components/Empty.svelte'
	import Table from '#lib/components/Table.svelte'
	import Heading from '#lib/components/Heading.svelte'
	import DefinitionList from '#lib/components/stats/DefinitionList.svelte'
	import { descriptors } from '#lib/font-face-descriptors.ts'
	import type { CssAnalysis } from '#lib/analyze-css.ts'
	import { create_keyboard_list, type OnChange } from '#lib/components/use-keyboard-list.svelte.ts'
	import { get_css_state } from '#lib/css-state.svelte.ts'
	import { hash } from '#lib/hash.ts'
	import { string_sort } from '#lib/string-sort.ts'
	import { to_css_location } from '#lib/analysis-locations.ts'

	let css_state = get_css_state()
	let {
		elements: { root, item }
	} = create_keyboard_list()

	type FontFaces = CssAnalysis['atrules']['font_faces']

	let { total = 0, items: unique = [], locations = [] }: Partial<FontFaces> = $props()
	let total_unique = $derived(unique.length)

	const font_style = 'font-style'
	const font_weight = 'font-weight'
	const font_family = 'font-family'
	const default_descriptors = [font_family, font_weight, font_style]
	const required_descriptors = [font_family, 'src']

	function normalize_font_weight(weight: string | undefined): number {
		if (weight === undefined) {
			return 400
		}
		if (weight === 'normal') {
			return 400
		}
		if (weight === 'bold') {
			return 700
		}
		if (weight === 'lighter') {
			return 100
		}
		if (weight === 'bolder') {
			return 700
		}

		let parsed = parseInt(weight, 10)
		if (Number.isFinite(parsed)) {
			return parsed
		}
		return 0
	}

	let sorted = $derived.by(() => {
		let items = Array.from({ length: total_unique }, (_, i) => i)
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
		let location = locations[unique_index]
		if (location) {
			css_state.select_item({
				type: 'font-face',
				node_type: 'atrule',
				value,
				locations: [to_css_location(location)]
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
						{ name: 'Unique', value: total_unique }
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
						<tr aria-selected={css_state.is_selected('font-face', value)} use:item={{ value }}>
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
							<td class="descriptor" class:warning={!Object.hasOwn(rule, 'src')}>
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

	th,
	td {
		overflow: hidden;
	}

	td {
		position: relative;
		max-inline-size: 25cqi;
	}

	code {
		white-space: nowrap;
		display: inline-block;
		vertical-align: middle;
		overflow: hidden;
		text-overflow: ellipsis;
		inline-size: 100%;
	}

	.warnings {
		margin-block-start: var(--space-4);
		padding-inline-start: var(--space-6);
		list-style-type: disc;
		list-style-position: outside;
	}
</style>
