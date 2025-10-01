<script lang="ts">
	// @ts-expect-error Pancake types are missing
	import * as Pancake from '@sveltejs/pancake'
	import { format_number } from '$lib/format-number'
	import { IsInViewport } from 'runed'
	interface Props {
		items: number[]
		max: number
		threshold?: number
	}

	let { items, max, threshold = -1 }: Props = $props()
	let points = $derived(items.map((item, index) => ({ x: index, y: item })))
	let wrapper = $state<HTMLElement | undefined>(undefined)
	let is_in_viewport = new IsInViewport(() => wrapper)
</script>

<div class="chart" bind:this={wrapper}>
	{#if is_in_viewport.current === true}
		<Pancake.Chart x1={0} x2={items.length} y1={0} y2={max}>
			<Pancake.Grid horizontal count={3}>
				{#snippet children({ value }: { value: number })}
					<!-- Only show whole numbers on the y-axis -->
					{#if Number.isInteger(value)}
						<div class="horizontal-ruler"></div>
						<span class="label-y">
							{format_number(value)}
						</span>
					{/if}
				{/snippet}
			</Pancake.Grid>

			{#if points.length > 0}
				<Pancake.Svg>
					<Pancake.SvgScatterplot data={points}>
						{#snippet children({ d }: { d: string })}
							<path class="dot" {d} />
						{/snippet}
					</Pancake.SvgScatterplot>
					{#if threshold != -1}
						<Pancake.SvgLine
							data={[
								{ x: 0, y: threshold },
								{ x: items.length, y: threshold }
							]}
						>
							{#snippet children({ d }: { d: string })}
								<path class="threshold" {d} />
							{/snippet}
						</Pancake.SvgLine>
					{/if}
				</Pancake.Svg>
			{/if}
		</Pancake.Chart>
	{/if}
</div>

<style>
	.chart {
		height: 8rem;
		margin-top: var(--space-2);
		padding-left: var(--space-2);
		padding-bottom: var(--space-1);
		width: 100%;
	}

	.label-y {
		position: absolute;
		left: 0;
		bottom: 0;
		margin-left: calc(-1 * var(--space-2));
		line-height: var(--leading-none);
		white-space: nowrap;
		font-size: var(--size-xs);
	}

	.dot {
		stroke: var(--teal-400);
		stroke-linejoin: round;
		stroke-linecap: round;
		stroke-width: 4px;
		fill: none;
	}

	@media print {
		.dot {
			stroke: var(--black);
		}
	}

	.threshold {
		stroke: var(--red-400);
		stroke-width: 3px;
	}

	.horizontal-ruler {
		position: relative;
		display: block;
		width: 100%;
		left: 0;
		border-bottom: 1px solid var(--gray-500);
	}
</style>
