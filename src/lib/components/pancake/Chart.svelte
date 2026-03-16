<script module>
	import { getContext } from 'svelte'

	const key = {}

	export function getChartContext() {
		return getContext(key)
	}
</script>

<script>
	import { setContext } from 'svelte'

	let { x1 = 0, y1 = 0, x2 = 1, y2 = 1, clip = false, children } = $props()

	function linear_scale(domain, range) {
		const d0 = domain[0]
		const r0 = range[0]
		const m = (range[1] - r0) / (domain[1] - d0)
		return Object.assign((num) => r0 + (num - d0) * m, {
			inverse: () => linear_scale(range, domain)
		})
	}

	let chart = $state()
	let width = $state(0)
	let height = $state(0)
	let pointer = $state(null)

	let x_scale = $derived(linear_scale([x1, x2], [0, 100]))
	let y_scale = $derived(linear_scale([y1, y2], [100, 0]))
	let x_scale_inverse = $derived(x_scale.inverse())
	let y_scale_inverse = $derived(y_scale.inverse())

	function handle_mousemove(e) {
		const bcr = chart.getBoundingClientRect()
		const left = e.clientX - bcr.left
		const top = e.clientY - bcr.top
		pointer = {
			x: x_scale_inverse((100 * left) / (bcr.right - bcr.left)),
			y: y_scale_inverse((100 * top) / (bcr.bottom - bcr.top)),
			left,
			top
		}
	}

	function handle_mouseleave() {
		pointer = null
	}

	setContext(key, {
		get x1() { return x1 },
		get y1() { return y1 },
		get x2() { return x2 },
		get y2() { return y2 },
		get x_scale() { return x_scale },
		get y_scale() { return y_scale },
		get x_scale_inverse() { return x_scale_inverse },
		get y_scale_inverse() { return y_scale_inverse },
		get pointer() { return pointer },
		get width() { return width },
		get height() { return height }
	})
</script>

<div
	class="pancake-chart"
	bind:this={chart}
	bind:clientWidth={width}
	bind:clientHeight={height}
	onmousemove={handle_mousemove}
	onmouseleave={handle_mouseleave}
	class:clip
>
	{@render children?.()}
</div>

<style>
	.pancake-chart {
		position: relative;
		display: block;
		width: 100%;
		height: 100%;
	}

	.clip {
		overflow: hidden;
	}
</style>
