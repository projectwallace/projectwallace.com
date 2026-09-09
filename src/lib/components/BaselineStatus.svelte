<script lang="ts">
	import type { CssFeature } from '#lib/baseline/css-feature.js'
	import { get_baseline_availability } from '#lib/baseline/baseline-status.js'

	let { feature }: { feature: CssFeature } = $props()

	let status = $derived(get_baseline_availability(feature))

	let label = $derived(
		status === 'widely' ? 'Widely available' : status === 'newly' ? 'Newly available' : 'Limited availability'
	)
</script>

<div class="baseline-status status-{status}">
	<div class="badge">
		<span class="icon" aria-hidden="true">
			{#if status === 'widely'}
				<svg viewBox="0 0 36 20">
					<path class="front" d="M18 8L20 10L18 12L16 10L18 8Z" />
					<path class="front" d="M26 0L28 2L10 20L0 10L2 8L10 16L26 0Z" />
					<path class="back" d="M28 2L26 4L32 10L26 16L22 12L20 14L26 20L36 10L28 2Z" />
					<path class="back" d="M10 0L2 8L4 10L10 4L14 8L16 6L10 0Z" />
				</svg>
			{:else if status === 'newly'}
				<svg viewBox="0 0 36 20">
					<path
						class="back"
						d="m10 0 2 2-2 2-2-2 2-2Zm4 4 2 2-2 2-2-2 2-2Zm16 0 2 2-2 2-2-2 2-2Zm4 4 2 2-2 2-2-2 2-2Zm-4 4 2 2-2 2-2-2 2-2Zm-4 4 2 2-2 2-2-2 2-2Zm-4-4 2 2-2 2-2-2 2-2ZM6 4l2 2-2 2-2-2 2-2Z"
					/>
					<path class="front" d="m26 0 2 2-18 18L0 10l2-2 8 8L26 0Z" />
				</svg>
			{:else}
				<svg viewBox="0 0 36 20">
					<path class="front" d="M10 0L16 6L14 8L8 2L10 0Z" />
					<path class="front" d="M22 12L20 14L26 20L28 18L22 12Z" />
					<path class="front" d="M26 0L28 2L10 20L8 18L26 0Z" />
					<path class="back" d="M8 2L10 4L4 10L10 16L8 18L0 10L8 2Z" />
					<path class="back" d="M28 2L36 10L28 18L26 16L32 10L26 4L28 2Z" />
				</svg>
			{/if}
		</span>
		<span class="label">{label}</span>
	</div>
</div>

<style>
	.baseline-status {
		display: inline-flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.badge {
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	.icon svg {
		width: 1.8rem;
		height: 1rem;
		display: block;
	}

	.status-widely .front {
		fill: light-dark(#1e8e3e, #24a446);
	}

	.status-widely .back {
		fill: light-dark(#c4eed0, #125225);
	}

	.status-newly .front {
		fill: light-dark(#1a73e8, #4185ff);
	}

	.status-newly .back {
		fill: light-dark(#a8c7fa, #2d509e);
	}

	.status-limited .front {
		fill: light-dark(#ea8600, #f09418);
	}

	.status-limited .back {
		fill: light-dark(#c6c6c6, #565656);
	}
</style>
