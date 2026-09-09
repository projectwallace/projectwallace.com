<script lang="ts">
	import Seo from '#lib/components/Seo.svelte'
	import Container from '#lib/components/Container.svelte'
	import Form from '#lib/components/css-form/Form.svelte'
	import Markdown from '#lib/components/Markdown.svelte'
	import Hero from '#lib/components/Hero.svelte'
	import Table from '#lib/components/Table.svelte'
	import BarChart from '#lib/components/BarChart.svelte'
	import TableBarChart from '#lib/components/stats/BarChart.svelte'
	import FilterGroup from '#lib/components/FilterGroup.svelte'
	import FilterOption from '#lib/components/FilterOption.svelte'
	import { get_css_state } from '#lib/css-state.svelte.js'
	import { analyze } from './calculate.js'
	import { group_by_year, EDGE_LAUNCH_DATE } from './group-by-year.js'
	import { summarize_usages } from './summarize-usages.js'
	import css_features from '#lib/data/css-features.generated.json'
	import type { CssFeature } from '#lib/data/css-feature.js'
	import { browsers } from '#lib/data/browsers.js'
	import Heading from '#lib/components/Heading.svelte'
	import BaselineStatus from '#lib/components/BaselineStatus.svelte'
	import BaselineSupportMatrix from '#lib/components/BaselineSupportMatrix.svelte'
	import { Header as PanelHeader, Panel } from '#lib/components/Panel/index.js'
	import { format_number } from '#lib/format-number.js'
	import DefinitionList from '#lib/components/stats/DefinitionList.svelte'
	import DevTools from '#lib/components/DevTools.svelte'
	import NetworkPanel from '#lib/components/NetworkPanel.svelte'
	import ItemUsage from '#lib/components/ItemUsage.svelte'
	import JsonPanel from '#lib/components/devtools/JsonPanel.svelte'
	import CssPanel from '#lib/components/devtools/CssPanel.svelte'
	import { analyzer_tabs, type TabId } from '#lib/components/devtools/tabs.js'
	import type { CssLocation } from '#lib/css-location.js'
	import { create_keyboard_list, type OnChange } from '#lib/components/use-keyboard-list.svelte.js'

	const browser_count = Object.keys(browsers).length

	function format_support(support: string[] | undefined) {
		if (!support) return undefined
		let names = support.map((id) => browsers[id] ?? id).join(', ')
		return `${support.length}/${browser_count}: ${names}`
	}

	let css_state = get_css_state()
	let usages = $derived(css_state.css.length > 0 ? analyze(css_state.css) : new Map())

	function compare_dates(a: string | undefined, b: string | undefined) {
		if (!a && !b) return 0
		if (!a) return 1
		if (!b) return -1
		return a.localeCompare(b)
	}

	type FeatureRow = {
		display_name: string
		name: string
		count: number
		locations: CssLocation[]
		widely_available_since: string | undefined
		newly_available_since: string | undefined
		support: string | undefined
		feature: CssFeature
	}

	let sortings = [
		{ id: 'feature', label: 'Sort by feature', fn: (a: FeatureRow, b: FeatureRow) => a.name.localeCompare(b.name) },
		{ id: 'count', label: 'Sort by count', fn: (a: FeatureRow, b: FeatureRow) => b.count - a.count },
		{
			id: 'widely-available-since',
			label: 'Sort by widely available since',
			fn: (a: FeatureRow, b: FeatureRow) => compare_dates(a.widely_available_since, b.widely_available_since)
		},
		{
			id: 'newly-available-since',
			label: 'Sort by newly available since',
			fn: (a: FeatureRow, b: FeatureRow) => compare_dates(a.newly_available_since, b.newly_available_since)
		}
	]

	let sorting = $state(sortings[1].id)

	let feature_rows = $derived.by(() => {
		let rows: FeatureRow[] = []

		for (let [feature_id, locations] of usages) {
			let feature = (css_features as Record<string, CssFeature>)[feature_id]
			// Edge's own launch stands in for a real support date on CSS old
			// enough to predate it - not a real "since" date, so drop the row.
			if (feature?.baseline_low_date === EDGE_LAUNCH_DATE) {
				continue
			}

			rows.push({
				display_name: feature.name,
				name: feature_id,
				count: locations.length,
				locations,
				widely_available_since: feature?.baseline === 'high' ? feature.baseline_high_date : undefined,
				newly_available_since: feature?.baseline_low_date,
				support: format_support(feature?.support),
				feature
			})
		}

		let sort = sortings.find((s) => s.id === sorting) ?? sortings[1]
		return rows.sort(sort.fn)
	})

	let widely_available_by_year = $derived(
		Array.from(group_by_year(usages), ([value, counts]) => ({
			value,
			count: counts.features,
			absoluteCount: counts.usages,
			locations: counts.locations
		}))
	)

	let usage_summary = $derived(summarize_usages(usages))
	let summary_rows = $derived([
		{ label: 'Widely available', counts: usage_summary.widely_available },
		{ label: 'Newly available', counts: usage_summary.newly_available },
		{ label: 'Limited availability', counts: usage_summary.limited_availability }
	])
	let summary_chart_data = $derived(Object.fromEntries(summary_rows.map((row) => [row.label, row.counts.features])))
	let report_json = $derived({
		summary: usage_summary,
		features: feature_rows,
		widely_available_by_year
	})

	let selected_item = $derived(css_state.selected_item)

	let {
		elements: { root: feature_rows_root, item: feature_rows_item }
	} = create_keyboard_list({
		scroll_selected_item_into_view: false
	})

	function on_feature_row_change({ value, active_index }: Parameters<OnChange>[0]) {
		let row = feature_rows[active_index]
		if (row) {
			css_state.select_item({
				type: 'feature-usage',
				value,
				locations: row.locations,
				node_type: 'rule'
			})
		}
	}
</script>

<Seo title="CSS Baseline overview" description="See the composition of your CSS based on Baseline features." />

<Hero>
	<Form>
		{#snippet title()}
			<h1 class="font-heading">Baseline overview</h1>
		{/snippet}
	</Form>
</Hero>

{#if usages.size > 0}
	<Container>
		<div class="report-grid">
			<div class="report-grid__section">
				<Panel>
					<PanelHeader>
						<Heading element="h2" size={3}>Baseline status summary</Heading>
					</PanelHeader>
					<BarChart
						data={summary_chart_data}
						title="Baseline status summary"
						alt="Number of distinct CSS features used, grouped by Baseline status: widely available, newly available, or limited availability"
						show_table={false}
					/>
					<Table>
						<thead>
							<tr>
								<th scope="col">Status</th>
								<th scope="col" class="numeric">Features</th>
								<th scope="col" class="numeric">Usages</th>
							</tr>
						</thead>
						<tbody>
							{#each summary_rows as row (row.label)}
								<tr>
									<td>{row.label}</td>
									<td class="numeric">{format_number(row.counts.features)}</td>
									<td class="numeric">{format_number(row.counts.usages)}</td>
								</tr>
							{/each}
						</tbody>
					</Table>
				</Panel>
			</div>

			<div class="report-grid__section">
				<Panel>
					<PanelHeader>
						<Heading element="h2" size={3}>Widely available features by year</Heading>
						<DefinitionList stats={[{ name: 'Years in range', value: new Date().getFullYear() - 2018 }]} />
					</PanelHeader>
					<TableBarChart
						items={widely_available_by_year}
						context="widely-available-by-year"
						column_headers={['Year', 'Features']}
						node_type="rule"
						extra_columns={[
							{
								values: widely_available_by_year.map((v) => v.absoluteCount),
								formatter: format_number,
								header: 'Usage'
							}
						]}
					/>
				</Panel>
			</div>

			<div class="report-grid__section--full">
				<Panel>
					<PanelHeader>
						<Heading element="h2" size={3}>Feature usage</Heading>
						<DefinitionList stats={[{ name: 'Total features', value: feature_rows.length }]} />
					</PanelHeader>
					<div class="stack">
						<FilterGroup>
							<legend class="sr-only">Sorting</legend>
							{#each sortings as sort (sort.id)}
								<FilterOption bind:group={sorting} value={sort.id} id="sort-{sort.id}" name="feature-usage-sorting">
									{sort.label}
								</FilterOption>
							{/each}
						</FilterGroup>
						<Table>
							<thead>
								<tr>
									<th scope="col" aria-sort={sorting === 'feature' ? 'ascending' : undefined}>Feature</th>
									<th scope="col" aria-sort={sorting === 'count' ? 'descending' : undefined} class="numeric">Count</th>
									<th scope="col">Baseline status</th>
									<th scope="col">Browser support</th>
									<th scope="col" aria-sort={sorting === 'widely-available-since' ? 'ascending' : undefined}>
										Widely available since
									</th>
									<th scope="col" aria-sort={sorting === 'newly-available-since' ? 'ascending' : undefined}>
										Newly available since
									</th>
								</tr>
							</thead>
							<tbody use:feature_rows_root={{ onchange: on_feature_row_change }}>
								{#each feature_rows as row (row.name)}
									{@const is_selected = selected_item?.type === 'feature-usage' && selected_item.value === row.name}
									<tr
										use:feature_rows_item={{ value: row.name }}
										class="clickable"
										aria-selected={is_selected ? 'true' : 'false'}
									>
										<td>{row.display_name}</td>
										<td class="numeric">{format_number(row.count)}</td>
										<td>
											<BaselineStatus feature={row.feature} />
										</td>
										<td>
											<BaselineSupportMatrix feature={row.feature} />
										</td>
										<td>{row.widely_available_since ?? 'N/A'}</td>
										<td>{row.newly_available_since ?? 'N/A'}</td>
									</tr>
								{/each}
							</tbody>
						</Table>
					</div>
				</Panel>
			</div>

			<div class="devtools">
				<DevTools tabs={analyzer_tabs}>
					{#snippet children({ tab_id }: { tab_id: TabId })}
						{#if tab_id === 'network'}
							<NetworkPanel />
						{:else if tab_id === 'inspector'}
							<ItemUsage />
						{:else if tab_id === 'report'}
							<JsonPanel json={report_json} />
						{:else if tab_id === 'css'}
							<CssPanel css={css_state.css} />
						{/if}
					{/snippet}
				</DevTools>
			</div>
		</div>
	</Container>
{/if}

<Container size="lg">
	<Markdown class="my-16">
		<h2>TODO: Content here</h2>
	</Markdown>
</Container>

<style>
	.font-heading {
		font-size: var(--size-5xl);
	}

	.report-grid {
		display: grid;
		row-gap: var(--space-5);
		column-gap: var(--space-5);

		@media (min-width: 44rem) {
			grid-template-columns: 1fr 1fr;
		}
	}

	.report-grid__section--full {
		grid-column: 1 / -1;
	}

	.devtools {
		grid-column: 1 / -1;
		position: sticky;
		inset-block-end: 0;
		inset-inline: 0;
	}

	.stack {
		display: grid;
		row-gap: var(--space-3);
	}

	tbody tr.clickable {
		cursor: pointer;
	}
</style>
