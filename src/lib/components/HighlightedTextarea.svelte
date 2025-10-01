<script lang="ts">
	import { highlight_css } from './use-css-highlight'

	type Props = Pick<HTMLTextAreaElement, 'name' | 'id'> & {
		value?: string
		on_cursor_move?: ({ start, end }: { start: number; end: number }) => void
	}

	let { value = $bindable(''), on_cursor_move, name, id }: Props = $props()
	let textarea: HTMLTextAreaElement

	function set_cursor_positions() {
		on_cursor_move?.({ start: textarea.selectionStart, end: textarea.selectionEnd })
	}
</script>

<div class="wrapper scroll-container">
	<textarea
		{name}
		{id}
		bind:value
		bind:this={textarea}
		onclick={set_cursor_positions}
		onkeyup={set_cursor_positions}
		onfocus={set_cursor_positions}
		spellcheck="false"
	></textarea>
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
			caret-color: var(--gray-100);
			resize: none;
			overflow: auto;

			&::selection {
				background-color: Highlight;
				color: var(--gray-100);
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
