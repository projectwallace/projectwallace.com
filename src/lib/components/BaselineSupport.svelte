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
			<Icon name={family as IconName} size={18} />
			<span class="support-icon">
				<Icon name={supported ? 'check' : 'cross'} size={10} />
			</span>
		</li>
	{/each}
</ul>

<style>
	[role='list'] {
		display: flex;
		column-gap: var(--space-2);
		list-style: none;
		margin-block: 0;
		padding-inline: 0;
	}

	.browser {
		display: flex;
		align-items: center;
		column-gap: var(--space-1);
		color: var(--fg-200);

		.support-icon {
			color: var(--baseline-color-widely);
		}

		&:not(.is-supported) {
			color: var(--fg-300);

			.support-icon {
				color: var(--baseline-color-limited);
			}
		}
	}

	.support-icon :global(svg) {
		/* Override <Icon>'s opacity: 0.75 */
		opacity: 1;
	}
</style>
