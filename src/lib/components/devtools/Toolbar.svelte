<script lang="ts">
	import Button from '#lib/components/Button.svelte'
	import CopyButton from '#lib/components/CopyButton.svelte'

	interface Props {
		text: string
		mime_type: string
		filename: string
		download_label: string
		copy_label: string
	}

	let { text, mime_type, filename, download_label, copy_label }: Props = $props()
</script>

<div class="toolbar">
	<Button
		element="a"
		variant="secondary"
		size="sm"
		icon="file"
		href={`data:${mime_type};charset=utf-8,${encodeURIComponent(text)}`}
		download={filename}
	>
		{download_label}
	</Button>
	<CopyButton {text}>{copy_label}</CopyButton>
</div>

<style>
	.toolbar {
		z-index: 1;
		position: fixed;
		inset-block-start: var(--space-4);
		inset-inline-end: var(--space-6);
	}
</style>
