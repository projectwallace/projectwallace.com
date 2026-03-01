<script lang="ts">
	import Seo from '$components/Seo.svelte'
	import AstExplorer from '$components/AstExplorer.svelte'
	import Container from '$components/Container.svelte'
	import Hero from '$components/Hero.svelte'
</script>

<Seo title="CSS AST Explorer" description="Explore the AST of your CSS using @projectwallace/css-parser" />

<Hero title="AST Explorer">
	<p class="lead">X-ray vision of your CSS.</p>
</Hero>

<Container>
	<AstExplorer />
</Container>
