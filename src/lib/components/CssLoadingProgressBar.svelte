<script lang="ts">
	import { tweened } from 'svelte/motion'
	import { cubicOut } from 'svelte/easing'
	import { onMount } from 'svelte'
	import Meter from '$lib/components/Meter.svelte'

	let timer_id: number | undefined = $state()

	const steps = [34, 54, 62, 70, 76, 80, 88, 89, 90, 94, 96, 100]
	let progress = tweened(1, {
		duration: 850,
		easing: cubicOut
	})

	onMount(() => {
		let step = 0
		timer_id = window.setInterval(function () {
			$progress = steps[step]
			step++

			if (step >= steps.length) {
				window.clearInterval(timer_id)
			}
		}, 800)

		return () => window.clearInterval(timer_id)
	})
</script>

<Meter value={$progress} max={100} --meter-height="5px" />
