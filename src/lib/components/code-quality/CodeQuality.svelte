<script lang="ts">
	import { fade } from 'svelte/transition'
	// @ts-expect-error Export issue with this package
	import { calculate } from '@projectwallace/css-code-quality/core'
	import type { calculate as Calculate } from '@projectwallace/css-code-quality'
	import { analyze } from '@projectwallace/css-analyzer'
	import CopyButton from '$components/CopyButton.svelte'
	import CodeQualityDetails from './CodeQualityDetails.svelte'
	import Panel from '$components/Panel.svelte'
	import FilterGroup from '$components/FilterGroup.svelte'
	import FilterOption from '$components/FilterOption.svelte'
	import Heading from '$components/Heading.svelte'
	import Container from '$components/Container.svelte'
	import type { CodeQualityDoc } from '$lib/code-quality'
	import Textarea from '$components/css-form/Textarea.svelte'

	type Props = {
		css?: string
		docs: Record<string, CodeQualityDoc>
	}

	let { css = '', docs }: Props = $props()

	let actuals = $derived(analyze(css, { useLocations: true }))
	let result = $derived<ReturnType<typeof Calculate>>(calculate(actuals))
	let category_filter: 'all' | 'maintainability' | 'complexity' | 'performance' = $state('all')
</script>

{#snippet stat(score: number, name: string)}
	<div class="stat">
		<dt class="stat-name">{name}</dt>
		<dd
			class={[
				'stat-value',
				{
					'stat-value-bad': score <= 50,
					'stat-value-medium': score > 50 && score < 80,
					'stat-value-good': score >= 80
				}
			]}
		>
			{score}
			<span class="sr-only">of 100</span>
		</dd>
	</div>
{/snippet}

<Container>
	<div class="layout">
		<header>
			<dl data-testid="css-quality-report" class="stats" in:fade>
				{@render stat(result.maintainability.score, 'Maintainability')}
				{@render stat(result.complexity.score, 'Complexity')}
				{@render stat(result.performance.score, 'Performance')}
			</dl>

			<dl class="score-indication">
				<dt class="sr-only">Bad</dt>
				<dd>
					<span class="score-indicator score-indicator-bad"></span>
					0 - 50
				</dd>
				<dt class="sr-only">Medium</dt>
				<dd>
					<span class="score-indicator score-indicator-medium"></span>
					50 - 80
				</dd>
				<dt class="sr-only">Good</dt>
				<dd>
					<span class="score-indicator score-indicator-good"></span>
					80 - 100
				</dd>
			</dl>
		</header>

		<Container size="2xl">
			<Heading element="h3">Score breakdown</Heading>
			<div class="filters">
				<span>Show only metrics for</span>
				<FilterGroup>
					<legend class="sr-only">Sorting box-shadows</legend>
					<FilterOption value="all" name="category-filter" bind:group={category_filter}>All</FilterOption>
					<FilterOption value="maintainability" name="category-filter" bind:group={category_filter}>
						Maintainability
					</FilterOption>
					<FilterOption value="complexity" name="category-filter" bind:group={category_filter}>Complexity</FilterOption>
					<FilterOption value="performance" name="category-filter" bind:group={category_filter}
						>Performance</FilterOption
					>
				</FilterGroup>
			</div>

			<ol class="result-list">
				{#each result.violations
					.sort((a, b) => b.score - a.score)
					.concat(result.passes)
					.filter((item) => {
						if (category_filter === 'all') return true
						if (category_filter === 'maintainability') return docs[item.id].category === category_filter
						if (category_filter === 'complexity') return docs[item.id].category === category_filter
						if (category_filter === 'performance') return docs[item.id].category === category_filter
					}) as rule (rule.id)}
					{@const doc = docs[rule.id]}
					{#if doc}
						<li class="result">
							<CodeQualityDetails
								id={doc.id}
								title={doc.title}
								value={rule.value}
								score={rule.score}
								open={rule.score !== 0}
								unit={doc.unit}
								format={doc.format}
								category={doc.category}
								{actuals}
								{css}
							>
								{@html doc.html}
							</CodeQualityDetails>
						</li>
					{/if}
				{/each}
			</ol>
		</Container>

		<Panel>
			<aside>
				<section>
					<header>
						<Heading element="h3">Raw CSS</Heading>
						<CopyButton text={css}>Copy CSS</CopyButton>
					</header>
					<Textarea name="css-output" id="css-output" value={css} wrap_lines readonly />
				</section>

				<section>
					<header>
						<Heading element="h3">Report JSON</Heading>
						<CopyButton text={JSON.stringify(result, undefined, 2)}>Copy JSON</CopyButton>
					</header>
					<Textarea name="json-output" id="json-output" value={JSON.stringify(result, undefined, 2)} readonly />
				</section>
			</aside>
		</Panel>
	</div>
</Container>

<style>
	.layout {
		display: grid;
		gap: var(--space-16);
	}

	.stats {
		display: flex;
		justify-content: center;
		gap: var(--space-16);
		margin-block: var(--space-8);
	}

	.stat {
		text-align: center;
	}

	.stat-name {
		text-transform: uppercase;
		color: var(--fg-0);
		font-weight: var(--font-bold);
	}

	.stat-value {
		font-size: var(--size-6xl);
		line-height: var(--leading-none);
		font-weight: var(--font-ultrabold);

		@media (min-width: 44rem) {
			font-size: var(--size-7xl);
		}
	}

	.stat-value-bad {
		color: var(--red-400);
	}

	.stat-value-medium {
		color: var(--orange-400);
	}

	.stat-value-good {
		color: var(--teal-400);
	}

	.score-indication {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: var(--space-6);
		max-width: 32rem;
		margin-top: var(--space-8);
		margin-inline: auto;
	}

	.score-indicator {
		display: inline-block;
		aspect-ratio: 1;
		width: 0.825em;
	}

	.score-indicator-bad {
		background-color: var(--red-400);
	}

	.score-indicator-medium {
		background-color: var(--orange-400);
	}

	.score-indicator-good {
		background-color: var(--teal-400);
	}

	.filters {
		text-align: end;
	}

	.result-list {
		display: grid;
		margin-top: var(--space-8);
		background-color: light-dark(transparent, var(--gray-800));
	}

	.result {
		border-width: 1px;
		border-style: solid;
		border-color: light-dark(var(--fg-850), var(--gray-450));
		padding-block: var(--space-3);
		padding-inline: var(--space-2) var(--space-4);
		overflow: clip;

		@media (prefers-color-scheme: dark) {
			border-width: 1px 0 0 0;
		}
	}

	aside {
		display: grid;
		gap: var(--space-8);

		section {
			display: grid;
			gap: var(--space-4);
		}

		header {
			display: flex;
			gap: var(--space-4);
			justify-content: space-between;
			align-items: baseline;
		}
	}
</style>
