<script lang="ts">
	import { highlight_css } from './use-css-highlight'
	import type { HTMLTextareaAttributes } from 'svelte/elements'

	type Props = Omit<HTMLTextareaAttributes, 'value'> & {
		value?: string
		on_cursor_move?: ({ start, end }: { start: number; end: number }) => void
	}

	let { value = $bindable(''), on_cursor_move, ...rest }: Props = $props()
	let textarea: HTMLTextAreaElement | undefined = undefined

	function set_cursor_positions() {
		if (!textarea || !on_cursor_move) return
		on_cursor_move({ start: textarea.selectionStart, end: textarea.selectionEnd })
	}
</script>

<div class="wrapper scroll-container">
	<!-- The text in this textarea is made invisible so the output can show the highlighted text -->
	<textarea
		bind:value
		bind:this={textarea}
		onclick={set_cursor_positions}
		onkeyup={set_cursor_positions}
		onfocus={set_cursor_positions}
		spellcheck="false"
		{...rest}
	></textarea>
	<!-- This output contains the highlighted CSS -->
	<output aria-hidden="true" use:highlight_css={{ css: value }}>{value}</output>
</div>

<style>
	.wrapper {
		display: grid;
		height: 100%;
		max-height: 100%;
		overflow: auto;

		> :is(textarea, output) {
			grid-column: 1 / -1;
			grid-row: 1 / -1;
			padding: 0;
			margin: 0;
			font-size: 0.8rem;
			line-height: 2;
			font-family: var(--font-mono);
			white-space: pre;
			height: 100%;
			hyphens: none;
		}

		textarea {
			color: rgb(255 255 255 / 0);
			background-color: transparent;
			caret-color: var(--fg-100);
			resize: none;
			overflow: auto;

			&::selection {
				background-color: Highlight;
				color: var(--fg-100);
			}

			&:focus {
				outline: none;
			}
		}

		output {
			pointer-events: none;
		}
	}
</style>
