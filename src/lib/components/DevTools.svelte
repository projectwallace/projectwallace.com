<script lang="ts">
	import { onMount, type Snippet } from 'svelte'
	import { innerHeight } from 'svelte/reactivity/window'
	import { createTabs, melt } from '@melt-ui/svelte'
	import Icon from '$lib/components/Icon.svelte'
	import { resize } from '$lib/components/use-resize.ts'
	import type { DevtoolsTab, TabId } from '$components/devtools/tabs.ts'
	import { get_css_state } from '$lib/css-state.svelte'

	let css_state = get_css_state()
	let selected_item = $derived(css_state.selected_item)

	const {
		elements: { root, list, content, trigger },
		states: { value }
	} = createTabs({
		autoSet: false,
		loop: true
	})

	interface Props {
		tabs: DevtoolsTab[]
		children?: Snippet<[{ tab_id: TabId }]>
	}

	let { tabs, children }: Props = $props()

	function close() {
		// @ts-expect-error Type mismatch in Melt UI
		// Close the tabs by setting the value to undefined works,
		// but $value does not accept undefined, even though that works
		value.set(undefined)
		css_state.unselect_item()
	}

	let devtools_element: HTMLDivElement
	let resize_offset = $state(0)
	let current_height = $state(0)
	let max_height = $state(0)

	onMount(function () {
		max_height = (innerHeight.current || 100) * 0.875
	})

	$effect(() => {
		if (selected_item !== undefined) {
			value.set('inspector')
		}
	})

	$effect(() => {
		if (css_state.run_id) {
			// closing the devtools when the run_id changes
			close()
		}
	})

	$effect(() => {
		if (devtools_element && $value !== undefined && Number.isFinite(resize_offset)) {
			current_height = devtools_element.scrollHeight
		}
	})
</script>

<div
	data-testid="devtools"
	class="devtools shadow-lg"
	style:--panel-offset="{resize_offset}px"
	bind:this={devtools_element}
	use:melt={$root}
>
	<button
		type="button"
		class="resize-bar"
		disabled={$value === undefined}
		use:resize
		onresize={(event) => (resize_offset = event.detail)}
		role="slider"
		aria-label="Resize devtools"
		aria-valuenow={Math.floor(current_height)}
		aria-valuemin={0}
		aria-valuemax={Math.floor(max_height)}
		aria-orientation="horizontal"
	>
		<span class="sr-only"> Resize devtools: press arrow up or down to resize. Press escape to stop resizing. </span>
	</button>

	<div class="toolbar">
		<ul role="tablist" use:melt={$list}>
			{#each tabs as tab}
				<li role="presentation">
					<button data-testid="devtools-tab-{tab.id}" use:melt={$trigger(tab.id)}>
						<Icon name={tab.icon} size={16} />
						{tab.name}
					</button>
				</li>
			{/each}
		</ul>
		{#if $value !== undefined}
			<button data-testid="close-devtools" class="close-devtools" onclick={close}>
				<Icon name="cross" size={12} />
				<span class="sr-only">Close devtools panel</span>
			</button>
		{/if}
	</div>

	{#each tabs as tab}
		<div use:melt={$content(tab.id)} class="scroll-container">
			{#if $value === tab.id}
				{@render children?.({ tab_id: tab.id })}
			{/if}
		</div>
	{/each}
</div>

<style>
	.devtools {
		position: relative;
	}

	.resize-bar {
		border-bottom: 3px solid var(--blue-400);
		padding-top: 9px;
		cursor: ns-resize;
		opacity: 0;
		transition: opacity 0.1s ease-out;
		display: block;
		width: 100%;

		&:focus {
			opacity: 1;
		}

		&:disabled {
			pointer-events: none;
		}

		@media (hover: hover) {
			&:hover {
				opacity: 1;
			}
		}
	}

	.toolbar {
		position: relative;
		display: flex;
		justify-content: space-between;
		background-color: var(--bg-100);
		border-top: 1px solid var(--fg-450);
		border-bottom: 1px solid var(--fg-450);
	}

	.close-devtools {
		padding: 0.33rem var(--space-3);

		@media (hover: hover) {
			&:hover {
				background-color: var(--bg-400);
				color: var(--fg-100);
			}
		}
	}

	ul {
		position: sticky;
		top: 0;
		left: 0;
		width: 100%;
		display: flex;
	}

	[role='tab'] {
		display: flex;
		align-items: center;
		gap: var(--space-1);
		padding: var(--space-1);
		border-top-width: 2px;
		border-style: solid;
		border-color: transparent;
		font-size: var(--size-sm);

		@media (min-width: 33rem) {
			gap: var(--space-2);
			padding: 0.3rem var(--space-3);
		}

		@media (hover: hover) {
			&:not([data-state='active']):hover {
				background-color: var(--bg-300);
				border-top-color: var(--bg-300);
			}
		}

		&[data-state='active'] {
			border-top-color: var(--accent);
			color: var(--fg-100);
		}
	}

	[role='tabpanel'] {
		background-color: var(--bg-100);
		height: calc(20rem + var(--panel-offset, 0));
		min-height: 1rem;
		max-height: 90vh;
		width: 100%;
		overflow-y: auto;
		contain: strict;
		overscroll-behavior-y: contain;
		will-change: height;
	}
</style>
