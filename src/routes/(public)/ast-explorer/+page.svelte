<script lang="ts">
	import Seo from '$components/Seo.svelte'
	import AstExplorer from '$components/AstExplorer.svelte'
	import Container from '$components/Container.svelte'

	let { data } = $props()
	let { css_tree_version } = $derived(data)
</script>

<Seo title="CSS AST Explorer" description="Explore the AST of your CSS using CSSTree" robots="noindex,follow" />

<Container>
	<AstExplorer {css_tree_version} />
</Container>
