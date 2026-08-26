<script lang="ts">
	import Seo from '#lib/components/Seo.svelte'
	import Container from '#lib/components/Container.svelte'
	import Form from '#lib/components/css-form/Form.svelte'
	import Markdown from '#lib/components/Markdown.svelte'
	import Hero from '#lib/components/Hero.svelte'
	import Table from '#lib/components/Table.svelte'
	import BarChart from '#lib/components/BarChart.svelte'
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
		name: string
		count: number
		widely_available_since: string | undefined
		newly_available_since: string | undefined
		support: string | undefined
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
			if (feature?.baseline_low_date === EDGE_LAUNCH_DATE) continue

			rows.push({
				name: feature?.name ?? feature_id,
				count: locations.length,
				widely_available_since: feature?.baseline === 'high' ? feature.baseline_high_date : undefined,
				newly_available_since: feature?.baseline_low_date,
				support: format_support(feature?.support)
			})
		}

		let sort = sortings.find((s) => s.id === sorting) ?? sortings[1]
		return rows.sort(sort.fn)
	})

	// BarChart takes a plain object, and JS always sorts numeric-looking keys
	// ("2018") ahead of non-numeric ones ("≤2017") regardless of insertion
	// order - so the ≤2017 bucket renders as the last bar, not the first.
	let widely_available_by_year = $derived(Object.fromEntries(group_by_year(usages)))

	let usage_summary = $derived(summarize_usages(usages))
	let summary_rows = $derived([
		{ label: 'Widely available', counts: usage_summary.widely_available },
		{ label: 'Newly available', counts: usage_summary.newly_available },
		{ label: 'Limited availability', counts: usage_summary.limited_availability }
	])
	let summary_chart_data = $derived(Object.fromEntries(summary_rows.map((row) => [row.label, row.counts.features])))
</script>

<Seo
	title="CSS Baseline overview"
	description="See the composition of your CSS with regards to different Baseline features."
/>

<Hero>
	<Form>
		{#snippet title()}
			<h1 class="font-heading">Baseline overview</h1>
		{/snippet}
	</Form>
</Hero>

<Container>
	<Heading element="h2">Baseline status summary</Heading>
	<BarChart
		data={summary_chart_data}
		title="Baseline status summary"
		alt="Number of distinct CSS features used, grouped by Baseline status: widely available, newly available, or limited availability"
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
					<td class="numeric">{row.counts.features}</td>
					<td class="numeric">{row.counts.usages}</td>
				</tr>
			{/each}
		</tbody>
	</Table>

	<Heading element="h2">Widely available features by year</Heading>
	<BarChart
		data={widely_available_by_year}
		title="Widely available features by year"
		alt="Number of distinct Baseline-widely-available CSS features used, grouped by the year they became widely available. Features whose exact year predates Microsoft Edge's 2015 launch are excluded, since Baseline only has an artifact date for them, not a real one."
	/>

	<Heading element="h2">Feature usage</Heading>
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
				<th scope="col" class="numeric" aria-sort={sorting === 'count' ? 'descending' : undefined}>Count</th>
				<th scope="col" aria-sort={sorting === 'widely-available-since' ? 'ascending' : undefined}>
					Widely available since
				</th>
				<th scope="col" aria-sort={sorting === 'newly-available-since' ? 'ascending' : undefined}>
					Newly available since
				</th>
				<th scope="col">Browser support</th>
			</tr>
		</thead>
		<tbody>
			{#each feature_rows as row (row.name)}
				<tr>
					<td>{row.name}</td>
					<td class="numeric">{row.count}</td>
					<td>{row.widely_available_since ?? '—'}</td>
					<td>{row.newly_available_since ?? '—'}</td>
					<td>{row.support ?? '—'}</td>
				</tr>
			{/each}
		</tbody>
	</Table>
</Container>

<Container size="lg">
	<Markdown class="my-16">
		<h2>TODO: Content here</h2>
	</Markdown>
</Container>

<style>
	.font-heading {
		font-size: var(--size-5xl);
	}
</style>
