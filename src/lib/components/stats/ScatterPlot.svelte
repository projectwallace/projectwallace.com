<script lang="ts">
	import { ScatterChart, Tooltip } from 'layerchart'
	import { format_number } from '#lib/format-number.js'
	import { IsInViewport } from 'runed'

	interface Props {
		items: number[]
		max: number
	}

	let { items, max }: Props = $props()
	let data = $derived(items.map((value, index) => ({ x: index, y: value })))
	let wrapper = $state<HTMLElement | undefined>(undefined)
	let is_in_viewport = new IsInViewport(() => wrapper)

	// Only show whole numbers on the y-axis, similar to the old Grid setup
	let y_ticks = $derived.by(() => {
		let count = Math.min(3, max)
		let ticks = new Set<number>([0])
		for (let i = 1; i <= count; i++) {
			ticks.add(Math.round((max / count) * i))
		}
		return [...ticks]
	})
</script>

<div class="chart" bind:this={wrapper}>
	{#if is_in_viewport.current === true && data.length > 0}
		<ScatterChart
			{data}
			x="x"
			y="y"
			xDomain={[0, Math.max(items.length - 1, 1)]}
			yDomain={[0, max]}
			padding={{ left: 28, top: 8, bottom: 4 }}
			axis="y"
			grid={{ y: true, yTicks: y_ticks }}
			props={{
				yAxis: { ticks: y_ticks, format: (value: number) => format_number(value) },
				points: { class: 'dot', r: 3 },
				highlight: { points: { class: 'dot-highlight', r: 5 }, lines: false }
			}}
		>
			{#snippet tooltip()}
				<Tooltip.Root class="tooltip" y="data" anchor="top" xOffset={0} yOffset={-8}>
					{#snippet children({ data }: { data: { x: number; y: number } })}
						<Tooltip.Header>{format_number(data.y)}</Tooltip.Header>
						<Tooltip.List>
							<Tooltip.Item label="Position" value="{data.x + 1} / {items.length}" />
						</Tooltip.List>
					{/snippet}
				</Tooltip.Root>
			{/snippet}
		</ScatterChart>
	{/if}
</div>

<style>
	.chart {
		height: 8rem;
		margin-top: var(--space-2);
		width: 100%;
	}

	.chart :global(.dot) {
		fill: var(--teal-400);
		stroke: none;
	}

	.chart :global(.dot-highlight) {
		fill: var(--teal-400);
		stroke: var(--bg-100);
		stroke-width: 2px;
	}

	.chart :global(.tick) {
		font-size: var(--size-xs);
	}

	.chart :global(.grid line) {
		stroke: var(--gray-500);
	}

	.chart :global(.tooltip) {
		background: var(--bg-200);
		border: 1px solid var(--gray-500);
		border-radius: var(--space-1);
		padding-block: var(--space-1);
		padding-inline: var(--space-2);
		font-size: var(--size-xs);
		white-space: nowrap;
	}

	@media (forced-colors: active) {
		.chart :global(.dot),
		.chart :global(.dot-highlight) {
			fill: CanvasText;
		}
	}

	@media print {
		.chart :global(.dot) {
			fill: var(--black);
		}
	}
</style>
