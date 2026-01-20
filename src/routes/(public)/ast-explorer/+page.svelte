<script lang="ts">
	import Seo from '$components/Seo.svelte'
	import AstExplorer from '$components/AstExplorer.svelte'
	import Container from '$components/Container.svelte'

	let { data } = $props()
	let { parser_version, parser_homepage, parser_name } = $derived(data)
</script>

<Seo title="CSS AST Explorer" description="Explore the AST of your CSS using {parser_name}" />

<Container>
	<AstExplorer {parser_version} {parser_homepage} />
</Container>
