<script lang="ts">
	import type { SvelteHTMLElements } from 'svelte/elements'

	type Props = SvelteHTMLElements['enhanced:img'] & { alt: string }

	let { src, alt, loading = 'lazy', ...rest }: Props = $props()
</script>

<enhanced:img {src} {alt} {loading} {...rest} />
