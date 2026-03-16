<script>
	import { getChartContext } from './Chart.svelte'

	const e10 = Math.sqrt(50)
	const e5 = Math.sqrt(10)
	const e2 = Math.sqrt(2)

	function get_ticks(start, stop, count = 5) {
		let reverse
		let i = -1
		let n
		let ticks
		let step

		if (start === stop && count > 0) return [start]

		if ((reverse = stop < start)) {
			;[start, stop] = [stop, start]
		}

		if ((step = increment(start, stop, count)) === 0 || !isFinite(step)) {
			return []
		}

		if (step > 0) {
			start = Math.ceil(start / step)
			stop = Math.floor(stop / step)
			ticks = Array.from({ length: (n = Math.ceil(stop - start + 1)) })
			while (++i < n) ticks[i] = (start + i) * step
		} else {
			start = Math.floor(start * step)
			stop = Math.ceil(stop * step)
			ticks = Array.from({ length: (n = Math.ceil(start - stop + 1)) })
			while (++i < n) ticks[i] = (start - i) / step
		}

		if (reverse) ticks.reverse()

		return ticks
	}

	function increment(start, stop, count) {
		const step = (stop - start) / Math.max(0, count)
		const power = Math.floor(Math.log(step) / Math.LN10)
		const error = step / Math.pow(10, power)
		return power >= 0
			? (error >= e10 ? 10 : error >= e5 ? 5 : error >= e2 ? 2 : 1) * Math.pow(10, power)
			: -Math.pow(10, -power) / (error >= e10 ? 10 : error >= e5 ? 5 : error >= e2 ? 2 : 1)
	}

	const ctx = getChartContext()

	let { count = undefined, ticks = undefined, vertical = false, children } = $props()

	let _ticks = $derived(ticks ?? (vertical ? get_ticks(ctx.x1, ctx.x2, count) : get_ticks(ctx.y1, ctx.y2, count)))

	function style(tick) {
		return vertical
			? `width: 0; height: 100%; left: ${ctx.x_scale(tick)}%`
			: `width: 100%; height: 0; top: ${ctx.y_scale(tick)}%`
	}
</script>

<div class="pancake-grid">
	{#each _ticks as tick, i}
		<div class="pancake-grid-item" style={style(tick)}>
			{@render children?.({ value: tick, first: i === 0, last: i === _ticks.length - 1 })}
		</div>
	{/each}
</div>

<style>
	.pancake-grid-item {
		position: absolute;
		left: 0;
		top: 0;
	}
</style>
