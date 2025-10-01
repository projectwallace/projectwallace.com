<script lang="ts">
	import Icon from '$lib/components/Icon.svelte'
	import Markdown from '$lib/components/Markdown.svelte'
	import { format_number } from '$lib/format-number'
	import { format_filesize } from '$lib/format-filesize'
	import ScatterPlot from '$lib/components/stats/ScatterPlot.svelte'
	import type { Snippet } from 'svelte'
	import type { CssAnalysis } from '$lib/analyze-css'

	interface Props {
		id: string
		title: string
		unit: string
		format: 'number' | 'percentage' | 'size'
		category: string
		score?: number
		value?: number
		open?: boolean
		actuals?: CssAnalysis
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
			warning: score <= 5 && score > 0,
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

			{#if id == 'Imports' && actuals.atrules.import.total > 0}
				<h3>Discovered @import rules</h3>
				<p>Found {actuals.atrules.import.total} items.</p>
				<ol style="max-height: var(--space-96); overflow: auto">
					{#each Object.entries(actuals.atrules.import.unique) as [rule, count]}
						<li>
							<code>@import {rule}</code> ({count}&times;)
						</li>
					{/each}
				</ol>
			{:else if id == 'TooMuchEmbeddedContent' && actuals.stylesheet.embeddedContent.size.total > 0}
				<h3>Discovered embedded contents</h3>
				<p>
					Found {actuals.stylesheet.embeddedContent.types.total} embedded items worth {format_filesize(
						actuals.stylesheet.embeddedContent.size.total
					)}.
				</p>
			{:else if id == 'AverageSelectorsPerRule'}
				<h3>Selectors per rule</h3>
				<ScatterPlot
					threshold={actuals.rules.selectors.mean}
					max={actuals.rules.selectors.max!}
					items={actuals.rules.selectors.items}
				/>
			{:else if id == 'MaxSelectorsPerRule'}
				{@const max = actuals.rules.selectors.max}
				{@const locations = actuals.rules.selectors.uniqueWithLocations![max!]}
				<ol>
					{#each locations as loc}
						<li>
							<pre dir="ltr" translate="no" style="overflow: auto;"><code class="language-css"
									>{css.substring(loc.offset, loc.offset + loc.length)}</code
								></pre>
						</li>
					{/each}
				</ol>
				<h3>Selectors per rule distribution</h3>
				<ScatterPlot max={actuals.rules.selectors.max!} items={actuals.rules.selectors.items} />
			{:else if id == 'MoreThanMostCommonSelectorsPerRule'}
				<h3>Selectors per rule</h3>
				<ScatterPlot
					threshold={actuals.rules.selectors.mode}
					max={actuals.rules.selectors.max!}
					items={actuals.rules.selectors.items}
				/>
			{:else if id == 'MoreThanMostCommonSelectorComplexity'}
				<h3>Selector complexity</h3>
				<ScatterPlot
					threshold={actuals.selectors.complexity.mode}
					max={actuals.selectors.complexity.max!}
					items={actuals.selectors.complexity.items}
				/>
			{:else if id == 'MaxSelectorComplexity'}
				{@const max = actuals.selectors.complexity.max}
				{@const locations = actuals.selectors.complexity.uniqueWithLocations![max!]}
				<h3>Your top complexity selectors</h3>
				<ol>
					{#each locations as loc}
						<li>
							<code>{css.substring(loc.offset, loc.offset + loc.length)}</code>
						</li>
					{/each}
				</ol>
				<h3>Selector complexity distribution</h3>
				<ScatterPlot max={actuals.selectors.complexity.max!} items={actuals.selectors.complexity.items} />
			{:else if id == 'AverageSelectorComplexity'}
				<h3>Selector complexity</h3>
				<ScatterPlot
					threshold={actuals.selectors.complexity.mean}
					max={actuals.selectors.complexity.max!}
					items={actuals.selectors.complexity.items}
				/>
			{:else if id == 'IdSelectorRatio' && actuals.selectors.id.total > 0}
				<h3>Discovered ID selectors</h3>
				<p>Found {actuals.selectors.id.total} ID selectors.</p>
				<ol class="max-h-96 overflow-auto">
					{#each Object.keys(actuals.selectors.id.uniqueWithLocations || {}) as selector}
						<li>
							<code>{selector}</code>
						</li>
					{/each}
				</ol>
			{:else if id == 'AverageDeclarationsPerRule'}
				<h3>Declarations per rule</h3>
				<ScatterPlot
					threshold={actuals.rules.declarations.mean}
					max={actuals.rules.declarations.max!}
					items={actuals.rules.declarations.items}
				/>
			{:else if id == 'MaxDeclarationsPerRule'}
				{@const max = actuals.rules.declarations.max}
				{@const locations = actuals.rules.declarations.uniqueWithLocations![max!]}
				<ol>
					{#each locations as loc}
						<li>
							<pre dir="ltr" translate="no" style="white-space: pre-wrap; overflow: hidden;"><code class="language-css"
									>{css.substring(loc.offset, loc.offset + loc.length)}</code
								></pre>
						</li>
					{/each}
				</ol>
				<h3>Declarations per rule distribution</h3>
				<ScatterPlot max={actuals.rules.declarations.max!} items={actuals.rules.declarations.items} />
			{:else if id == 'MoreThanMostCommonDeclarationsPerRule'}
				<h3>Selectors per rule distribution</h3>
				<ScatterPlot
					threshold={actuals.rules.declarations.mode}
					max={actuals.rules.declarations.max!}
					items={actuals.rules.declarations.items}
				/>
			{:else if id === 'MoreThanMostCommonSelectorSpecificity'}
				<h3>Your top specificity selectors</h3>
				{@const max = actuals.selectors.specificity.max.toString()}
				{@const locations = actuals.selectors.specificity.uniqueWithLocations![max]}
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
		border-left: 4px solid transparent;
		padding-inline-start: var(--space-4);
		/* contain: style content; */

		&.error {
			border-left-color: var(--red-300);
		}

		&.warning {
			border-left-color: var(--orange-400);
		}

		&.info {
			border-left-color: var(--teal-400);
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
		margin-right: var(--space-2);
		font-weight: var(--font-bold);
	}

	.value {
		margin-left: var(--space-2);
		margin-right: auto;
	}

	.content {
		padding-left: var(--space-2);
		padding-bottom: var(--space-4);

		@media (min-width: 33rem) {
			padding-left: var(--space-4);
		}

		@media (min-width: 44rem) {
			padding-left: var(--space-6);
		}
	}

	.category {
		color: var(--fg-300);
		text-align: right;
	}
</style>
