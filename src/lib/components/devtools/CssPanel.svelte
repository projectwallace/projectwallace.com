<script lang="ts">
	import Pre from '#lib/components/Pre.svelte'
	import Toolbar from './Toolbar.svelte'

	interface Props {
		css?: string
	}

	let { css = '' }: Props = $props()
</script>

<Toolbar
	text={css}
	mime_type="text/css"
	filename="projectwallace-css.css"
	download_label="Download CSS"
	copy_label="Copy CSS"
/>

<Pre {css} />
