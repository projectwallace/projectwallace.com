<script lang="ts">
	import type { CssFeature } from '#lib/baseline/css-feature.js'
	import { browser_families } from '#lib/baseline/browsers.js'
	import { get_baseline_availability, is_browser_supported } from '#lib/baseline/baseline-status.js'
	import type { IconName } from '#lib/components/Icon.svelte'
	import Icon from '#lib/components/Icon.svelte'

	let { feature }: { feature: CssFeature } = $props()

	let availability = $derived(get_baseline_availability(feature))
</script>

<ul class="matrix status-{availability}" role="list">
	{#each Object.entries(browser_families) as [family, { name, ids }] (family)}
		{@const supported = is_browser_supported(feature, availability, ids)}
		<li class="browser" class:is-supported={supported}>
			<span class="sr-only">{name}: {supported ? 'Supported' : 'Not supported'}</span>
			<span class="browser-logo">
				<Icon name={family as IconName} size={18} />
			</span>
			<span class="support-icon" aria-hidden="true">
				{#if supported}
					<svg viewBox="0 0 16 16"
						><path fill="currentColor" d="M6.3 12.3 2.5 8.5l1.4-1.4 2.4 2.4 5.4-5.4 1.4 1.4-6.8 6.8Z" /></svg
					>
				{:else}
					<svg viewBox="0 0 16 16"
						><path
							fill="currentColor"
							d="m4.6 3.2 3.4 3.4 3.4-3.4 1.4 1.4L9.4 8l3.4 3.4-1.4 1.4L8 9.4l-3.4 3.4-1.4-1.4L6.6 8 3.2 4.6l1.4-1.4Z"
						/></svg
					>
				{/if}
			</span>
		</li>
	{/each}
</ul>

<style>
	.matrix {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.browser {
		display: flex;
		align-items: center;
		gap: 2px;
		color: #fff;
	}

	.browser {
		color: var(--fg-200);

		&:not(.is-supported) {
			color: var(--fg-300);
		}
	}

	.support-icon svg {
		width: 0.75rem;
		height: 0.75rem;
		display: block;
	}

	.browser.is-supported .support-icon {
		color: var(--success-400);
	}

	.browser:not(.is-supported) .support-icon {
		color: var(--baseline-color-limited);
	}
</style>
