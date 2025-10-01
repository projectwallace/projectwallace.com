<script lang="ts">
	import type { HTMLTextareaAttributes } from 'svelte/elements'

	interface TextareaProps extends HTMLTextareaAttributes {
		id: NonNullable<HTMLTextareaAttributes['id']>
		name: NonNullable<HTMLTextareaAttributes['name']>
		resize?: 'vertical' | 'horizontal' | 'both' | 'none'
		auto_grow?: boolean
		wrap_lines?: boolean
	}

	let {
		placeholder = `html {\n\tfont-size: 100%;\n}`,
		value = $bindable(''),
		wrap_lines = false,
		resize = 'vertical',
		rows = 12,
		auto_grow = false,
		...rest
	}: TextareaProps = $props()

	function on_keydown(event: KeyboardEvent) {
		let textarea = event.target as HTMLTextAreaElement
		let form = textarea.form

		if (event.metaKey && event.key === 'Enter' && form) {
			// requestSubmit() will trigger browser validation first instead of
			// directly submitting the form when the textarea could be empty
			form.requestSubmit()
		}
	}
</script>

<textarea
	{...rest}
	{placeholder}
	{rows}
	bind:value
	class={['input scroll-container', { wrap: wrap_lines, 'auto-grow': auto_grow }]}
	spellcheck="false"
	autocapitalize="off"
	autocomplete="off"
	wrap="soft"
	onkeydown={on_keydown}
	style:resize
></textarea>

<style>
	textarea {
		width: 100%;
		min-height: var(--space-36);
		max-height: 70vh;
		font-family: var(--font-mono);
		font-size: var(--size-sm);
		line-height: var(--size-base);
		white-space: pre;

		&.wrap {
			white-space: pre-wrap;
		}

		&.auto-grow {
			field-sizing: content;
		}
	}
</style>
