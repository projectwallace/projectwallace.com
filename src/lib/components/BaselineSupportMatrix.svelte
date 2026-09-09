<script lang="ts">
	import type { CssFeature } from '#lib/data/css-feature.js'
	import BaselineSupport from '#lib/components/BaselineSupport.svelte'

	let { feature }: { feature: CssFeature } = $props()
</script>

<div class="support-matrix">
	<div class="device">
		<span class="device-label">Desktop</span>
		<BaselineSupport {feature} device="desktop" />
	</div>
	<div class="device">
		<span class="device-label">Mobile</span>
		<BaselineSupport {feature} device="mobile" />
	</div>
</div>

<style>
	.support-matrix {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.device {
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	.device-label {
		font-size: var(--size-xs);
		color: light-dark(var(--gray-600), var(--gray-400));
		min-width: 4rem;
	}
</style>
