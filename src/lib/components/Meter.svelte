<script lang="ts">
	import type { HTMLMeterAttributes } from 'svelte/elements'

	let { max, min = 0, value = 0 }: HTMLMeterAttributes = $props()
</script>

<meter {min} {max} {value}></meter>

<style>
	meter {
		--_meter-color: var(--meter-color, light-dark(var(--accent), var(--accent-500)));
		--_meter-bg: var(--meter-bg, var(--bg-200));
		--_meter-height: var(--meter-height, 1em);
		width: 100%;
		background: var(--_meter-bg);
		height: var(--_meter-height);
		vertical-align: middle;
	}

	meter::-webkit-meter-bar {
		background: var(--_meter-bg);
		border: none;
		border-radius: 0;
		height: var(--_meter-height);
	}

	meter::-webkit-meter-optimum-value {
		background: var(--_meter-color);
		border-radius: 0;
	}

	meter::-moz-meter-bar {
		background: var(--_meter-color);
	}

	@media print {
		meter::-webkit-meter-optimum-value {
			border: 1px solid;
		}

		meter::-moz-meter-bar {
			border: 1px solid;
		}
	}
</style>
