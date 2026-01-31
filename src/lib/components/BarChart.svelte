<script lang="ts">
	import { format_number } from '$lib/format-number'

	type Props = {
		data: Record<string, number>
		formatter?: (value: number) => string
		title: string
	}

	let { data, formatter = format_number, title }: Props = $props()

	// Chart dimensions
	const width = 928
	const height = 384
	const margin = { top: 30, right: 60, bottom: 40, left: 70 }
	const chart_width = width - margin.left - margin.right
	const chart_height = height - margin.top - margin.bottom
	const bar_width = 39.5
	const num_y_ticks = 10

	// Calculate scales - derived from data
	const max_value = $derived(Math.max(...Object.values(data)))
	const y_max = $derived.by(() => {
		// Determine rounding magnitude based on max value
		if (max_value === 0) {
			return 1
		} else if (max_value < 1) {
			return Math.ceil(max_value * 10) / 10 // Round to nearest 0.1
		} else if (max_value <= 100) {
			return Math.ceil(max_value / 10) * 10 // Round to nearest 10
		}
		return Math.ceil(max_value / 100) * 100 // Round to nearest 100
	})
	const y_scale = $derived(chart_height / y_max)
	const bar_spacing = $derived(chart_width / Object.values(data).length)

	// Generate y-axis ticks with nice round numbers
	const y_ticks = $derived.by(() => {
		// When all values are 0, only show a 0 tick
		if (max_value === 0) {
			return [{ value: 0, y: chart_height }]
		}

		// Calculate ideal step size
		const ideal_step = y_max / (num_y_ticks - 1)

		// Find magnitude and round to nice increment (1, 2, 5, 10, 20, 50, 100, etc.)
		const magnitude = Math.pow(10, Math.floor(Math.log10(ideal_step)))
		const normalized = ideal_step / magnitude
		const nice_step = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10
		const step = nice_step * magnitude

		// Generate ticks from 0 to yMax using the nice step
		const ticks = []
		for (let value = 0; value <= y_max; value += step) {
			const y = chart_height - value * y_scale
			ticks.push({ value, y })
		}
		return ticks
	})

	// Generate bars
	const bars = $derived(
		Object.entries(data).map(([label, value], i) => {
			const x = i * bar_spacing + bar_spacing / 2 - bar_width / 2
			const bar_height = value * y_scale
			const y = chart_height - bar_height
			return {
				x,
				y,
				width: bar_width,
				height: bar_height,
				label: label,
				value: value,
				center_x: i * bar_spacing + bar_spacing / 2
			}
		})
	)

	let uid = $props.id()
</script>

<div id={uid} class="chart-title">{title}</div>

<svg xmlns="http://www.w3.org/2000/svg" class="chart" role="img" aria-labelledby={uid} viewBox="0 0 {width} {height}">
	<g transform="translate({margin.left},{margin.top})">
		<!-- Grid lines -->
		<g class="grid" style="stroke: currentcolor; opacity: 0.2;" fill="none" text-anchor="end">
			<path class="domain" stroke="currentColor" d="M{chart_width},{chart_height}H0V0H{chart_width}" />
			{#each y_ticks as tick}
				<g class="tick" opacity="1" transform="translate(0,{tick.y})">
					<line stroke="currentColor" x2={chart_width} />
				</g>
			{/each}
		</g>

		<!-- Y-axis -->
		<g fill="none" text-anchor="end">
			<path stroke="currentColor" d="M-6,{chart_height}H0V0H-6" />
			{#each y_ticks as tick}
				<g class="tick" opacity="1" transform="translate(0,{tick.y})">
					<line stroke="currentColor" x2="-6" />
					<text fill="currentColor" x="-9" dy="0.32em" class="axis-label">
						{formatter(tick.value)}
					</text>
				</g>
			{/each}
		</g>

		<!-- X-axis -->
		<g transform="translate(0,{chart_height})" fill="none" text-anchor="middle">
			<path stroke="currentColor" d="M0,6V0H{chart_width}V6" />
			{#each bars as bar}
				<g class="tick" opacity="1" transform="translate({bar.center_x},0)">
					<line stroke="currentColor" y2="6" />
					<text fill="currentColor" y="9" dy="0.7em" text-anchor="middle" class="axis-label">
						{bar.label}
					</text>
				</g>
			{/each}
		</g>

		<!-- Bars -->
		{#each bars as bar}
			<rect x={bar.x} y={bar.y} width={bar.width} height={bar.height} fill="currentColor" class="bar" />
			<text x={bar.center_x} y={bar.y - 10} text-anchor="middle" fill="currentColor" class="bar-label">
				{formatter(bar.value)}
			</text>
		{/each}
	</g>
</svg>

<details>
	<summary>View chart as table</summary>
	<table>
		<caption>{title}</caption>
		<thead>
			<tr>
				<th scope="col">Percentile</th>
				<th scope="col">Value</th>
			</tr>
		</thead>
		<tbody>
			{#each bars as bar}
				<tr>
					<th scope="row">{bar.label}</th>
					<td>{formatter(bar.value)}</td>
				</tr>
			{/each}
		</tbody>
	</table>
</details>

<style>
	.chart-title {
		margin-block-start: var(--space-6);
		margin-block-end: calc(var(--space-6) * -1);
		text-transform: uppercase;
		font-size: var(--size-sm);
		font-weight: var(--font-bold);
		text-align: center;
	}

	.axis-label {
		font-size: 1rem;
	}

	.bar {
		fill: var(--accent-400);
	}

	.bar-label {
		font-size: 1rem;
		fill: var(--fg-200);
	}

	text {
		fill: currentColor;
		color: var(--fg-200);
	}

	summary {
		text-align: center;
		font-size: var(--size-base);
	}
</style>
