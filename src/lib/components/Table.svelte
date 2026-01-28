<script lang="ts">
	import type { SvelteHTMLElements } from 'svelte/elements'

	type Props = SvelteHTMLElements['div']

	let { children, class: classname, ...rest }: Props = $props()
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div class={['scroller scroll-container', classname]} tabindex="0" {...rest}>
	<table class="pw-table">
		{#if children}
			{@render children()}
		{/if}
	</table>
</div>

<style>
	.scroller {
		overflow-x: auto;
		height: 100%;
		max-height: 100%;
		max-width: 100%;
		container-type: inline-size;
	}

	:where(.pw-table) {
		width: 100%;
		border-collapse: collapse;
		--pw-table-font-size: 0.925rem;
		--pw-table-padding-block: 0.33rem;
		font-size: var(--pw-table-font-size);

		:global {
			thead tr {
				position: sticky;
				top: 0;
				z-index: 2;
				inset-inline: 0;
				/* Double border-width because it otherwise doesn't show */
				border-bottom: 2px solid var(--fg-450);
			}

			:is(th, td) {
				text-align: start;
				padding: var(--pw-table-padding-block) var(--space-2);
			}

			td:not(:first-child) {
				border-inline-start: 1px solid var(--fg-450);
			}

			th,
			td:first-child {
				white-space: nowrap;
			}

			:where(tr:nth-child(even)) {
				background-color: var(--uneven-tr-bg);
			}

			td {
				line-height: var(--leading-snug);
				vertical-align: baseline;
			}

			.numeric {
				text-align: end;
				white-space: nowrap;
				font-variant-numeric: tabular-nums;
				/* "Looks about right" */
				letter-spacing: -0.1ch;
			}
		}
	}
</style>
