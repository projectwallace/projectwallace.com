<script module>
	import { getContext } from 'svelte'

	const key = {}

	export function getChartContext() {
		return getContext(key)
	}
</script>

<script>
	import { setContext } from 'svelte'

	let { x1 = 0, y1 = 0, x2 = 1, y2 = 1, children } = $props()

	function linear_scale(domain, range) {
		const d0 = domain[0]
		const r0 = range[0]
		const m = (range[1] - r0) / (domain[1] - d0)
		return Object.assign((num) => r0 + (num - d0) * m)
	}

	let chart = $state()
	let width = $state(0)
	let height = $state(0)

	let x_scale = $derived(linear_scale([x1, x2], [0, 100]))
	let y_scale = $derived(linear_scale([y1, y2], [100, 0]))

	setContext(key, {
		get x1() {
			return x1
		},
		get y1() {
			return y1
		},
		get x2() {
			return x2
		},
		get y2() {
			return y2
		},
		get x_scale() {
			return x_scale
		},
		get y_scale() {
			return y_scale
		},
		get width() {
			return width
		},
		get height() {
			return height
		},
	})
</script>

<div class="pancake-chart" bind:this={chart} bind:clientWidth={width} bind:clientHeight={height}>
	{@render children?.()}
</div>

<style>
	.pancake-chart {
		position: relative;
		display: block;
		width: 100%;
		height: 100%;
	}
</style>
