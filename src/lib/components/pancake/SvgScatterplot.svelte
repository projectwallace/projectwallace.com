<script>
	import { getChartContext } from './Chart.svelte'

	const ctx = getChartContext()

	let { data, x = (d) => d.x, y = (d) => d.y, children } = $props()

	let d = $derived(
		data
			.map((point, i) => {
				const _x = ctx.x_scale(x(point, i))
				const _y = ctx.y_scale(y(point, i))
				return `M${_x} ${_y} A0 0 0 0 1 ${_x + 0.0001} ${_y + 0.0001}`
			})
			.join(' '),
	)
</script>

{@render children?.({ d })}
