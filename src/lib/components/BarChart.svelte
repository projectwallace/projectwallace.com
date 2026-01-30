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
	const margin = { top: 30, right: 60, bottom: 60, left: 70 }
	const chartWidth = width - margin.left - margin.right
	const chartHeight = height - margin.top - margin.bottom
	const barWidth = 39.5
	const numYTicks = 10

	// Calculate scales - derived from data
	const maxValue = $derived(Math.max(...Object.values(data)))
	const yMax = $derived.by(() => {
		// Determine rounding magnitude based on max value
		if (maxValue === 0) {
			return 1
		} else if (maxValue < 1) {
			return Math.ceil(maxValue * 10) / 10 // Round to nearest 0.1
		} else if (maxValue <= 100) {
			return Math.ceil(maxValue / 10) * 10 // Round to nearest 10
		} else {
			return Math.ceil(maxValue / 100) * 100 // Round to nearest 100
		}
	})
	const yScale = $derived(chartHeight / yMax)
	const barSpacing = $derived(chartWidth / Object.values(data).length)

	// Generate y-axis ticks with nice round numbers
	const yTicks = $derived.by(() => {
		// When all values are 0, only show a 0 tick
		if (maxValue === 0) {
			return [{ value: 0, y: chartHeight }]
		}

		// Calculate ideal step size
		const idealStep = yMax / (numYTicks - 1)

		// Find magnitude and round to nice increment (1, 2, 5, 10, 20, 50, 100, etc.)
		const magnitude = Math.pow(10, Math.floor(Math.log10(idealStep)))
		const normalized = idealStep / magnitude
		const niceStep = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10
		const step = niceStep * magnitude

		// Generate ticks from 0 to yMax using the nice step
		const ticks = []
		for (let value = 0; value <= yMax; value += step) {
			const y = chartHeight - value * yScale
			ticks.push({ value, y })
		}
		return ticks
	})

	// Generate bars
	const bars = $derived(
		Object.entries(data).map(([label, value], i) => {
			const x = i * barSpacing + barSpacing / 2 - barWidth / 2
			const barHeight = value * yScale
			const y = chartHeight - barHeight
			return {
				x,
				y,
				width: barWidth,
				height: barHeight,
				label: label,
				value: value,
				centerX: i * barSpacing + barSpacing / 2
			}
		})
	)
</script>

<svg xmlns="http://www.w3.org/2000/svg" class="venz-chart" role="img" viewBox="0 0 {width} {height}">
	<title>{title}</title>
	<g transform="translate({margin.left},{margin.top})">
		<!-- Grid lines -->
		<g class="grid" style="stroke: currentcolor; opacity: 0.2;" fill="none" text-anchor="end">
			<path class="domain" stroke="currentColor" d="M{chartWidth},{chartHeight}H0V0H{chartWidth}" />
			{#each yTicks as tick}
				<g class="tick" opacity="1" transform="translate(0,{tick.y})">
					<line stroke="currentColor" x2={chartWidth} />
				</g>
			{/each}
		</g>

		<!-- Y-axis -->
		<g fill="none" text-anchor="end">
			<path stroke="currentColor" d="M-6,{chartHeight}H0V0H-6" />
			{#each yTicks as tick}
				<g class="tick" opacity="1" transform="translate(0,{tick.y})">
					<line stroke="currentColor" x2="-6" />
					<text fill="currentColor" x="-9" dy="0.32em" class="axis-label">
						{formatter(tick.value)}
					</text>
				</g>
			{/each}
		</g>

		<!-- X-axis -->
		<g transform="translate(0,{chartHeight})" fill="none" text-anchor="middle">
			<path stroke="currentColor" d="M0,6V0H{chartWidth}V6" />
			{#each bars as bar}
				<g class="tick" opacity="1" transform="translate({bar.centerX},0)">
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
			<text x={bar.centerX} y={bar.y - 10} text-anchor="middle" fill="currentColor" class="bar-label">
				{formatter(bar.value)}
			</text>
		{/each}
	</g>
</svg>

<style>
	.axis-label {
		font-size: 1rem;
	}

	.bar {
		fill: steelblue;
		fill: var(--accent-400, steelblue);
	}

	.bar-label {
		font-size: 1rem;
		fill: var(--fg-200, white);
	}

	text {
		fill: currentColor;
		color: var(--fg-200);
	}
</style>
