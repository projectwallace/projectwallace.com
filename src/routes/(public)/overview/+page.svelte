<script lang="ts">
	import { browser } from '$app/environment'
	import Seo from '$components/Seo.svelte'
	import Hero from '$components/Hero.svelte'
	import Container from '$components/Container.svelte'
	import Form from '$components/css-form/Form.svelte'
	import Button from '$components/Button.svelte'
	import Empty from '$components/Empty.svelte'
	import OverviewCard from '$components/overview/OverviewCard.svelte'
	import OverviewStat from '$components/overview/OverviewStat.svelte'
	import { get_css_state } from '$lib/css-state.svelte'
	import { analyze } from '@projectwallace/css-analyzer'
	import { format_filesize } from '$lib/format-filesize'
	import { format_percentage } from '$lib/format-number'
	import { calculate_coverage } from '@projectwallace/css-code-coverage'
	import { summarize_lint_warnings, LINT_CATEGORIES, LINT_CATEGORY_LABELS } from '$lib/lint-summary'

	let css_state = get_css_state()
	let has_css = $derived(css_state.origins.length > 0)
	let analysis = $derived(has_css ? analyze(css_state.css, { useLocations: true }) : undefined)
	let coverage = $derived(
		css_state.coverage && css_state.coverage.length > 0 ? calculate_coverage(css_state.coverage) : undefined
	)

	type LintStatus = 'idle' | 'loading' | 'done' | 'error'
	let lint_status = $state<LintStatus>('idle')
	let lint_counts = $state<Record<string, number> | undefined>(undefined)

	async function run_lint_summary(css: string) {
		lint_status = 'loading'
		try {
			const response = await fetch('/api/lint-css', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ css, preset: 'recommended' })
			})
			if (response.ok) {
				const data = await response.json()
				lint_counts = summarize_lint_warnings(data.result.warnings)
				lint_status = 'done'
			} else {
				lint_status = 'error'
			}
		} catch {
			lint_status = 'error'
		}
	}

	$effect(() => {
		if (browser && has_css && css_state.css) {
			run_lint_summary(css_state.css)
		}
	})
</script>

<Seo
	title="CSS Overview"
	description="A high-level summary of your CSS: stylesheet size, design tokens, lint issues, and coverage, with links to the full reports."
/>

<Hero>
	<Form>
		{#snippet title()}
			<h1 class="font-heading">Overview</h1>
		{/snippet}
	</Form>
</Hero>

{#if has_css && analysis}
	<Container size="xl">
		<div class="overview-grid">
			<OverviewCard title="CSS Analysis" href="/analyze-css">
				<OverviewStat
					label="Lines of code"
					value={analysis.stylesheet.sourceLinesOfCode}
					href="/analyze-css#stylesheet"
				/>
				<OverviewStat
					label="Filesize"
					value={format_filesize(analysis.stylesheet.size)}
					href="/analyze-css#stylesheet"
				/>
				<OverviewStat label="Rules" value={analysis.rules.total} href="/analyze-css#rulesets" />
				<OverviewStat label="Selectors" value={analysis.selectors.total} href="/analyze-css#selectors" />
				<OverviewStat label="Declarations" value={analysis.declarations.total} href="/analyze-css#declarations" />
			</OverviewCard>

			<OverviewCard title="Design Tokens" href="/design-tokens">
				<OverviewStat label="Colors" value={analysis.values.colors.total} href="/design-tokens#colors" />
				<OverviewStat label="Unique colors" value={analysis.values.colors.totalUnique} href="/design-tokens#colors" />
				<OverviewStat
					label="Font sizes"
					value={analysis.values.fontSizes.totalUnique}
					href="/design-tokens#font-sizes"
				/>
				<OverviewStat
					label="Font families"
					value={analysis.values.fontFamilies.totalUnique}
					href="/design-tokens#font-families"
				/>
			</OverviewCard>

			<OverviewCard title="Linting" href="/lint-css">
				{#if lint_status === 'loading' || lint_status === 'idle'}
					<Empty>Linting&hellip;</Empty>
				{:else if lint_status === 'error'}
					<Empty>Could not lint this CSS.</Empty>
				{:else if lint_counts}
					{#each LINT_CATEGORIES as category}
						<OverviewStat
							label={LINT_CATEGORY_LABELS[category]}
							value={lint_counts[category]}
							href={`/lint-css?preset=${category}`}
						/>
					{/each}
				{/if}
			</OverviewCard>

			<OverviewCard title="Coverage" href="/css-coverage#coverage-summary">
				{#if coverage}
					<OverviewStat
						label="Line coverage"
						value={format_percentage(coverage.line_coverage_ratio)}
						href="/css-coverage#coverage-summary"
					/>
					<OverviewStat
						label="Unused size"
						value={format_filesize(coverage.uncovered_bytes)}
						href="/css-coverage#coverage-summary"
					/>
				{:else}
					<div class="coverage-cta">
						<Empty>Upload a DevTools coverage export to see unused CSS here.</Empty>
						<Button element="a" href="/css-coverage" variant="secondary" size="md">Go to Coverage</Button>
					</div>
				{/if}
			</OverviewCard>
		</div>
	</Container>
{/if}

<style>
	.overview-grid {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: var(--space-6);

		@media (min-width: 55rem) {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}

	.coverage-cta {
		grid-column: 1 / -1;
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: var(--space-4);
		justify-items: start;
	}
</style>
