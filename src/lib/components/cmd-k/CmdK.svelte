<script lang="ts">
	import ComboBox from './ComboBox.svelte'
	import { afterNavigate } from '$app/navigation'

	let open = $state(false)
	let popover = $state<HTMLElement | undefined>(undefined)

	function hide_popover() {
		if (open) {
			popover?.hidePopover()
		}
	}

	function reset() {
		hide_popover()
	}

	function start() {
		popover?.showPopover()
	}

	function on_window_keydown(event: KeyboardEvent) {
		if (!event.repeat && (event.metaKey || event.ctrlKey) && event.key === 'k') {
			// Prevent browser focusing address bar
			event.preventDefault()
			start()
			return
		}

		if (open && event.key === 'Escape') {
			// Prevent default behavior of the Escape key: closing fullscreen mode in MacOS
			event.preventDefault()
			// close the dialog
			hide_popover()
		}
	}

	function ontoggle(event: ToggleEvent) {
		open = event.newState === 'open'

		if (event.newState === 'open') {
			start()
		} else {
			reset()
		}
	}

	afterNavigate(() => reset())
</script>

<svelte:window onkeydown={on_window_keydown} />

<button
	aria-haspopup="true"
	aria-controls="cmdk-popover"
	aria-expanded={open}
	popovertarget="cmdk-popover"
	id="cmdk-trigger"
	class="cmd-k"
>
	<span aria-hidden="true">
		<kbd>⌘</kbd>
		<kbd>K</kbd>
	</span>
	<span class="sr-only">Open command menu</span>
</button>

<div
	class="dialog"
	role="menu"
	popover="auto"
	id="cmdk-popover"
	aria-label="Command menu"
	bind:this={popover}
	{ontoggle}
>
	<ComboBox />
</div>

<style>
	.cmd-k {
		padding: var(--space-1) var(--space-2);
		border: 1px solid var(--fg-700);
		color: var(--fg-300);
		font-size: var(--size-sm);
		display: flex;
		align-items: center;
		gap: var(--space-1);
		white-space: nowrap;

		&:focus-visible {
			border-color: var(--accent);
		}

		& kbd:first-of-type {
			font-size: 1.2em;
		}

		@media (max-width: 44rem) {
			display: none;
		}

		&[aria-expanded='true'] {
			background-color: var(--bg-200);
			border-color: var(--fg-450);
			color: light-dark(var(--fg-0), var(--accent-500));
		}
	}

	.dialog::backdrop {
		position: fixed;
		background-color: color-mix(in srgb, var(--black) 50%, transparent);
	}

	.dialog {
		position: fixed;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
		width: 90vw;
		max-width: 48rem;
		background-color: var(--bg-200);
		border: 1px solid var(--fg-450);
	}
</style>
