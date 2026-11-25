<script lang="ts">
	import Icon from '#lib/components/Icon.svelte'
	import Markdown from '#lib/components/Markdown.svelte'
	import { format_number } from '#lib/format-number.ts'
	import { format_filesize } from '#lib/format-filesize.ts'
	import ScatterPlot from '#lib/components/stats/ScatterPlot.svelte'
	import type { Snippet } from 'svelte'
	import type { CodeQualityAnalysis } from '#lib/analyze-css.ts'
	import { with_locations } from '#lib/analysis-locations.ts'
	import { summarize_numbers } from '@projectwallace/css-analyzer'
	import { summarize_specificity } from '@projectwallace/css-analyzer/collectors'

	interface Props {
		id: string
		title: string
		unit?: string
		format: 'number' | 'percentage' | 'size'
		category: string
		score?: number
		value?: number
		open?: boolean
		actuals?: CodeQualityAnalysis
		css?: string
		children?: Snippet
	}

	let {
		id,
		title,
		unit,
		format,
		category,
		score = 0,
		value = 0,
		open = $bindable(false),
		actuals = Object.create(null),
		css = '',
		children
	}: Props = $props()

	function on_toggle(event: Event) {
		let target = event.target as HTMLDetailsElement
		open = target.open
	}
</script>

<details
	{open}
	class={[
		'details',
		{
			error: score > 5,
			warn: score <= 5 && score > 0,
			info: !score
		}
	]}
	ontoggle={on_toggle}
	data-testid="quality-rule"
>
	<summary data-testid="code-quality-detail-summary" class="summary">
		<span>
			<span class="title">{title}</span>
			&mdash;
			<span class="value">
				{#if format === 'number'}
					{format_number(value, { decimals: 2 })}
				{:else if format === 'percentage'}
					{format_number(value * 100, { decimals: 1 })}%
				{:else if format === 'size'}
					{format_filesize(value)}
				{:else}
					{value}
				{/if}

				{#if unit}
					{unit}
				{/if}
			</span>
		</span>

		<Icon name={open ? 'chevron-up' : 'chevron-down'} size={12} />
	</summary>

	<div class="content">
		<Markdown>
			{@render children?.()}

			{#if id == 'Imports' && actuals.atrules.imports.total > 0}
				<h3>Discovered @import rules</h3>
				<p>Found {actuals.atrules.imports.total} items.</p>
				<ol style:max-block-size="var(--space-96)" style:overflow="auto">
					{#each [...actuals.atrules.imports.unique] as [rule, { count }]}
						<li>
							<code>@import {rule}</code> ({count}&times;)
						</li>
					{/each}
				</ol>
			{:else if id == 'TooMuchEmbeddedContent' && actuals.stylesheet.embedded.size > 0}
				<h3>Discovered embedded contents</h3>
				<p>
					Found {actuals.stylesheet.embedded.total} embedded items worth {format_filesize(
						actuals.stylesheet.embedded.size
					)}.
				</p>
			{:else if id == 'AverageSelectorsPerRule'}
				<h3>Selectors per rule</h3>
				<ScatterPlot
					max={summarize_numbers(actuals.rules.selectors).max}
					items={actuals.rules.selectors.sequence ?? []}
				/>
			{:else if id == 'MaxSelectorsPerRule'}
				{@const max = summarize_numbers(actuals.rules.selectors).max}
				{@const locations = with_locations(actuals.rules.selectors)[max] ?? []}
				<ol>
					{#each locations as loc}
						<li>
							<pre dir="ltr" translate="no" style:overflow="auto" style:max-inline-size="100%"><code
									class="language-css">{css.substring(loc.offset, loc.offset + loc.length)}</code
								></pre>
						</li>
					{/each}
				</ol>
				<h3>Selectors per rule distribution</h3>
				<ScatterPlot
					max={summarize_numbers(actuals.rules.selectors).max}
					items={actuals.rules.selectors.sequence ?? []}
				/>
			{:else if id == 'MoreThanMostCommonSelectorsPerRule'}
				<h3>Selectors per rule</h3>
				<ScatterPlot
					max={summarize_numbers(actuals.rules.selectors).max}
					items={actuals.rules.selectors.sequence ?? []}
				/>
			{:else if id == 'MoreThanMostCommonSelectorComplexity'}
				<h3>Selector complexity</h3>
				<ScatterPlot
					max={summarize_numbers(actuals.selectors.complexity).max}
					items={actuals.selectors.complexity.sequence ?? []}
				/>
			{:else if id == 'MaxSelectorComplexity'}
				{@const max = summarize_numbers(actuals.selectors.complexity).max}
				{@const locations = with_locations(actuals.selectors.complexity)[max] ?? []}
				<h3>Your top complexity selectors</h3>
				<ol>
					{#each locations as loc}
						<li>
							<code>{css.substring(loc.offset, loc.offset + loc.length)}</code>
						</li>
					{/each}
				</ol>
				<h3>Selector complexity distribution</h3>
				<ScatterPlot
					max={summarize_numbers(actuals.selectors.complexity).max}
					items={actuals.selectors.complexity.sequence ?? []}
				/>
			{:else if id == 'AverageSelectorComplexity'}
				<h3>Selector complexity</h3>
				<ScatterPlot
					max={summarize_numbers(actuals.selectors.complexity).max}
					items={actuals.selectors.complexity.sequence ?? []}
				/>
			{:else if id == 'IdSelectorRatio' && actuals.selectors.ids.total > 0}
				<h3>Discovered ID selectors</h3>
				<p>Found {actuals.selectors.ids.total} ID selectors.</p>
				<ol class="max-h-96 overflow-auto">
					{#each [...actuals.selectors.ids.unique.keys()] as selector}
						<li>
							<code>{selector}</code>
						</li>
					{/each}
				</ol>
			{:else if id == 'AverageDeclarationsPerRule'}
				<h3>Declarations per rule</h3>
				<ScatterPlot
					max={summarize_numbers(actuals.rules.declarations).max}
					items={actuals.rules.declarations.sequence ?? []}
				/>
			{:else if id == 'MaxDeclarationsPerRule'}
				{@const max = summarize_numbers(actuals.rules.declarations).max}
				{@const locations = with_locations(actuals.rules.declarations)[max] ?? []}
				<ol>
					{#each locations as loc}
						<li>
							<pre dir="ltr" translate="no" style:white-space="pre-wrap" style:overflow="hidden"><code
									class="language-css">{css.substring(loc.offset, loc.offset + loc.length)}</code
								></pre>
						</li>
					{/each}
				</ol>
				<h3>Declarations per rule distribution</h3>
				<ScatterPlot
					max={summarize_numbers(actuals.rules.declarations).max}
					items={actuals.rules.declarations.sequence ?? []}
				/>
			{:else if id == 'MoreThanMostCommonDeclarationsPerRule'}
				<h3>Selectors per rule distribution</h3>
				<ScatterPlot
					max={summarize_numbers(actuals.rules.declarations).max}
					items={actuals.rules.declarations.sequence ?? []}
				/>
			{:else if id === 'MoreThanMostCommonSelectorSpecificity'}
				<h3>Your top specificity selectors</h3>
				{@const max = summarize_specificity(actuals.specificity).max.join(',')}
				{@const locations = with_locations(actuals.specificity)[max] ?? []}
				<ol>
					{#each locations as loc}
						<li>
							<code>{css.substring(loc.offset, loc.offset + loc.length)}</code>
						</li>
					{/each}
				</ol>
			{/if}
		</Markdown>
	</div>

	<p class="category">
		Category: {category}
	</p>
</details>

<style>
	.details {
		border-inline-start-width: var(--border-width-lg);
		border-inline-start-style: var(--border-style-solid);
		border-inline-start-color: transparent;
		padding-inline-start: var(--space-4);

		&.error {
			border-inline-start-color: var(--red-300);
		}

		&.warn {
			border-inline-start-color: var(--orange-400);
		}

		&.info {
			border-inline-start-color: var(--teal-400);
		}
	}

	.summary {
		cursor: pointer;
		color: var(--fg-100);
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.title {
		color: var(--fg-100);
		margin-inline-end: var(--space-2);
		font-weight: var(--font-bold);
	}

	.value {
		margin-inline-start: var(--space-2);
		margin-inline-end: auto;
	}

	.content {
		padding-inline-start: var(--space-2);
		padding-block-end: var(--space-4);

		@media (min-width: 33rem) {
			padding-inline-start: var(--space-4);
		}

		@media (min-width: 44rem) {
			padding-inline-start: var(--space-6);
		}
	}

	.category {
		color: var(--fg-300);
		text-align: end;
	}
</style>
