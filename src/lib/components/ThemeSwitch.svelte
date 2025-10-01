<script lang="ts">
	import { onMount } from 'svelte'
	import type { Theme } from '$lib/theme'
	import Icon from '$components/Icon.svelte'
	import ThemePreview from './ThemePreview.svelte'
	import { MediaQuery } from 'svelte/reactivity'

	type Props = {
		initial_theme?: Theme
	}

	let { initial_theme }: Props = $props()
	let theme = $state<Theme | undefined>(initial_theme)
	let prefers_light = new MediaQuery('(prefers-color-scheme: light)', false)
	let popover_open = $state(false)
	let popover: HTMLElement | undefined = undefined

	function set_theme(theme: Theme) {
		document.documentElement.dataset.theme = theme
	}

	onMount(() => {
		if (!initial_theme) {
			// If no initial theme is provided, we need to check the system preference
			if (prefers_light.current) {
				theme = 'light'
			} else {
				theme = 'dark'
			}
			set_theme(theme)
		}

		popover?.addEventListener('keydown', prevent_fullscreen_close)

		return () => {
			popover?.removeEventListener('keydown', prevent_fullscreen_close)
		}
	})

	function ontoggle(event: ToggleEvent) {
		popover_open = event.newState === 'open'
	}

	async function save_preference() {
		// TODO: debounce
		if (theme) {
			set_theme(theme)
		}
		await fetch('/api/theme', {
			method: 'POST',
			headers: {
				'Content-Type': 'text/plain'
			},
			body: theme
		})
	}

	function get_theme_icon(theme?: Theme): 'sun' | 'moon' {
		switch (theme) {
			case 'light':
				return 'sun'
			case 'dark':
				return 'moon'
			default: {
				if (prefers_light.current) {
					return 'sun'
				}
				return 'moon'
			}
		}
	}

	function prevent_fullscreen_close(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			if (popover_open) {
				popover?.hidePopover()
			}
			event.preventDefault()
		}
	}
</script>

<div class="theme-switch">
	<button
		type="button"
		aria-haspopup="true"
		aria-controls="theme-popover"
		aria-expanded={popover_open ? 'true' : undefined}
		popovertarget="theme-popover"
		class="theme-popover-trigger"
	>
		<Icon name={get_theme_icon(theme)} size={16} />
		<span class="sr-only">Choose website theme</span>
	</button>

	<div class="theme-popover" id="theme-popover" popover="auto" {ontoggle} bind:this={popover}>
		<fieldset onchange={save_preference}>
			<legend class="sr-only">Pick a theme</legend>
			<div class="theme-options">
				<label for="light" class={{ selected: theme === 'light' }}>
					<ThemePreview theme="light" />
					<!-- svelte-ignore a11y_autofocus -->
					<input type="radio" name="theme" id="light" value="light" bind:group={theme} autofocus={theme === 'light'} />
					<span class="theme-name">Light</span>
				</label>

				<label for="dark" class={{ selected: theme === 'dark' }}>
					<ThemePreview theme="dark" />
					<!-- svelte-ignore a11y_autofocus -->
					<input type="radio" name="theme" id="dark" value="dark" bind:group={theme} autofocus={theme === 'dark'} />
					<span class="theme-name">Dark</span>
				</label>

				<label for="system" class={{ selected: theme === 'system' }}>
					<ThemePreview theme="system" />
					<!-- svelte-ignore a11y_autofocus -->
					<input
						type="radio"
						name="theme"
						id="system"
						value="system"
						bind:group={theme}
						autofocus={theme === 'system'}
					/>
					<span class="theme-name">System</span>
				</label>

				<label for="naked" class={{ selected: theme === 'naked' }}>
					<ThemePreview theme="naked" />
					<!-- svelte-ignore a11y_autofocus -->
					<input type="radio" name="theme" id="naked" value="naked" bind:group={theme} autofocus={theme === 'naked'} />
					<span class="theme-name">Naked (no CSS)</span>
				</label>
			</div>
		</fieldset>
	</div>
</div>

<style>
	.theme-popover-trigger {
		padding: var(--space-1) var(--space-2);
		border: 1px solid var(--fg-700);
		color: var(--fg-300);
		font-size: var(--size-sm);
		display: block;
		anchor-name: --theme-popover-trigger;

		&[aria-expanded='true'] {
			background-color: var(--bg-200);
			border-color: var(--fg-450);
			color: light-dark(var(--fg-0), var(--accent-500));
		}

		&:focus-visible {
			border-color: var(--accent);
		}

		:global(.icon) {
			margin-top: -4px;
		}
	}

	.theme-popover {
		position-anchor: --theme-popover-trigger;
		position: absolute;
		top: calc(anchor(end) + var(--space-2));
		right: anchor(end);
		left: auto;
		width: min-content;
		background-color: var(--bg-100);
		border: 1px solid var(--fg-450);
		padding: var(--space-8);
		box-shadow: var(--shadow-2xl);

		@media (min-width: 44rem) {
			width: fit-content;
		}

		@supports not (right: anchor(end)) {
			position: fixed;
			top: 3.5em;
			right: 2em;
		}
	}

	.theme-options {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-8);
		align-items: start;
	}

	label {
		display: block;
		width: var(--space-48);
		border: 1px solid var(--fg-450);
		background-color: light-dark(transparent, var(--bg-0));
		cursor: pointer;

		&.selected {
			outline: 2px solid light-dark(var(--accent-600), var(--accent));
			outline-offset: 2px;
		}

		input {
			margin-inline-start: var(--space-2);
		}
	}

	.theme-name {
		padding-block: var(--space-1);
		padding-inline: var(--space-1);
		display: inline-block;
		font-weight: var(--font-bold);
		font-size: var(--size-sm);
	}
</style>
