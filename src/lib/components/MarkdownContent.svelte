<script lang="ts">
	import type { Snippet } from 'svelte'
	import Markdown from '$lib/components/Markdown.svelte'
	import Panel from '$lib/components/Panel.svelte'

	interface Props {
		children?: Snippet
	}

	let { children }: Props = $props()
</script>

<Panel element="div">
	<Markdown>
		{@render children?.()}
	</Markdown>
</Panel>
