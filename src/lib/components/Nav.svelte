<script lang="ts">
	import { useResizeObserver } from 'runed'
	import Logo from '$lib/components/Logo.svelte'
	import Container from '$lib/components/Container.svelte'
	import { page } from '$app/state'
	import { onNavigate } from '$app/navigation'
	import { items } from './Nav.items'
	import { get_css_state } from '$lib/css-state.svelte'
	import { onMount, type Snippet } from 'svelte'

	let { children }: { children: Snippet } = $props()

	let wrapper = $state<HTMLElement | undefined>(undefined)
	let popover_open = $state(false)
	let popover = $state<HTMLElement | undefined>(undefined)

	onNavigate(() => {
		hide_popover()
	})

	function hide_popover() {
		if (popover_open) {
			popover?.hidePopover()
		}
	}

	function ontoggle(event: ToggleEvent) {
		popover_open = event.newState === 'open'
	}

	let nodes: HTMLLIElement[] = $state([])
	let is_overflowing = $state(false)
	let overflow_index = $state(-1)
	let css_state = get_css_state()
	let rewritten_items = $derived.by(() => {
		return items.map((item) => {
			let url = new URL(item.url, page.url.origin)
			if (css_state.url !== undefined) {
				url.searchParams.set('url', css_state.url)
				url.searchParams.set('prettify', css_state.should_prettify ? '1' : '0')
			}
			return {
				...item,
				url: url.pathname + url.search + url.hash,
				canonical: item.url
			}
		})
	})

	function on_resize() {
		if (document.documentElement.dataset.theme === 'naked') return
		// The first node that doesn't have the same top position as the previous one
		// is the first node that's wrapped on a new line
		let first_top = nodes[0].getBoundingClientRect().top
		let last_top = nodes.at(-1).getBoundingClientRect().top
		if (last_top === first_top) {
			is_overflowing = false
			overflow_index = -1
			popover?.hidePopover()
		} else {
			is_overflowing = true

			for (let i = 1; i < nodes.length; i++) {
				let node = nodes[i]
				if (node.getBoundingClientRect().top > first_top) {
					overflow_index = nodes.indexOf(node)
					break
				}
			}
		}
	}

	useResizeObserver(() => wrapper, on_resize)

	onMount(() => {
		window?.addEventListener('keydown', prevent_fullscreen_close)

		return () => {
			window?.removeEventListener('keydown', prevent_fullscreen_close)
		}
	})

	function prevent_fullscreen_close(event: KeyboardEvent) {
		if (event.key === 'Escape' && popover_open) {
			event.preventDefault()
			hide_popover()
		}
	}
</script>

<nav class="nav" aria-label="Primary">
	<Container>
		<div class="nav-inner">
			<Logo />
			<ul class="nav-list" role="list" bind:this={wrapper}>
				{#each rewritten_items as item, index (item.url)}
					{@const is_hidden = is_overflowing && index >= overflow_index}
					<li bind:this={nodes[index]} aria-hidden={is_hidden ? 'true' : undefined}>
						<a
							class="nav-item"
							href={item.url}
							tabindex={is_hidden ? -1 : undefined}
							aria-current={page.url.pathname.startsWith(item.canonical) ? 'page' : undefined}
						>
							{item.title}
						</a>
					</li>
				{/each}
			</ul>

			<div class="others">
				{#if is_overflowing}
					<button
						type="button"
						popovertarget="nav-popover"
						aria-label="Additional navigation items"
						aria-haspopup="true"
						aria-controls="nav-popover"
						aria-expanded={popover_open ? 'true' : 'false'}
						class="nav-popover-trigger"
						class:invisible={!is_overflowing}
					>
						<span aria-hidden="true">&hellip;</span>
						<span class="sr-only">Additional navigation items</span>
					</button>
					<div popover="auto" class="nav-popover" id="nav-popover" bind:this={popover} {ontoggle}>
						<ul class="nav-popover-list">
							{#each items.slice(overflow_index) as item (item.url)}
								<li>
									<a
										class="popover-item"
										href={item.url}
										aria-current={page.url.pathname.startsWith(item.url) ? 'page' : undefined}
									>
										{item.title}
									</a>
								</li>
							{/each}
						</ul>
					</div>
				{/if}
				{@render children?.()}
			</div>
		</div>
	</Container>
</nav>

<style>
	.nav {
		--nav-border-height: 0.25rem;
		--nav-gap: var(--space-2);
		--nav-others-gap: var(--space-2);
		--nav-font-size: var(--size-sm);
		--item-block-padding: var(--space-2);
		--item-inline-padding: var(--space-1);
		border-top: var(--space-1) solid var(--accent);
		background-color: var(--bg-0);
		border-bottom: 1px solid var(--fg-800);

		@media (min-width: 44rem) {
			--nav-gap: var(--space-3);
			--nav-font-size: var(--size-base);
			--item-block-padding: var(--space-4);
		}

		@media (min-width: 66rem) {
			--nav-gap: var(--space-4);
		}
	}

	.nav-inner {
		display: flex;
		gap: var(--nav-gap);
		align-items: baseline;
	}

	.nav-list {
		display: flex;
		flex-wrap: wrap;
		gap: var(--nav-gap);
		align-items: baseline;
		font-size: var(--nav-font-size);
		height: calc(
			var(--nav-font-size) * var(--leading-base) + var(--item-block-padding) + var(--item-block-padding) +
				var(--nav-border-height)
		);
		overflow: hidden;

		& > li {
			flex-shrink: 0;
		}

		@media print {
			display: none;
		}
	}

	.nav-item,
	.popover-item {
		display: block;
		padding: var(--item-block-padding) var(--item-inline-padding);
		font-weight: var(--font-medium);
		color: var(--fg-200);
		white-space: nowrap;
	}

	.nav-item {
		border-bottom: var(--nav-border-height) solid transparent;

		&:hover,
		&:focus {
			border-bottom-color: var(--fg-700);
		}
	}

	.nav-item[aria-current='page'] {
		&,
		&:hover,
		&:focus {
			color: var(--fg-100);
			border-bottom-color: var(--accent);
		}
	}

	.others {
		display: flex;
		gap: var(--nav-others-gap);
		align-items: center;
		margin-left: auto;
	}

	.nav-popover-trigger {
		display: block;
		padding: var(--space-1) var(--space-3);
		border: 1px solid var(--fg-700);
		anchor-name: --nav-popover-trigger;

		&[aria-expanded='true'] {
			background-color: var(--bg-200);
			border-color: var(--fg-450);
		}

		&.invisible {
			visibility: hidden;
			pointer-events: none;
		}
	}

	.nav-popover {
		position: absolute;
		position-anchor: --nav-popover-trigger;
		top: calc(anchor(end) + var(--space-2));
		right: anchor(end);
		left: auto;
		width: max-content;
		background-color: var(--fg-900);
		padding: var(--space-2);
		border: 1px solid var(--fg-450);
		transition: opacity 0.05s ease-out;
		box-shadow: var(--shadow);

		@supports not (right: anchor(end)) {
			position: fixed;
			top: 3em;
			right: 3em;
		}
	}

	.nav-popover-list {
		display: grid;
		gap: var(--space-2);
	}

	.popover-item {
		padding: var(--space-1) var(--space-3);
		border-inline-start: var(--space-1) solid transparent;
		border-inline-end: var(--space-1) solid transparent;
		font-size: var(--nav-font-size);

		&[aria-current='page'] {
			color: var(--fg-200);
			border-inline-start-color: var(--accent-500);

			&:hover {
				border-inline-start-color: var(--accent-400);
			}
		}

		&:hover,
		&:focus {
			background-color: var(--bg-300);
		}
	}
</style>
