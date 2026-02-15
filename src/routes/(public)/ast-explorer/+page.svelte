<script lang="ts">
	import Seo from '$components/Seo.svelte'
	import AstExplorer from '$components/AstExplorer.svelte'
	import Container from '$components/Container.svelte'
</script>

<Seo title="CSS AST Explorer" description="Explore the AST of your CSS using @projectwallace/css-parser" />

<Container>
	<AstExplorer />
</Container>
