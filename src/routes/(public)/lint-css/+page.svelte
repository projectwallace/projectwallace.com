<script lang="ts">
	import Seo from '$components/Seo.svelte'
	import Linter from '$components/Linter.svelte'
	import Container from '$components/Container.svelte'
	import Hero from '$components/Hero.svelte'
</script>

<Seo title="TODO" description="TODO" />

<Hero title="Lint CSS">
	<p class="lead">
		Use Project Wallace's <a href="https://github.com/projectwallace/stylelint-plugin" rel="external">
			Stylelint plugin
		</a> to quickly audit your CSS.
	</p>
</Hero>

<Container>
	<Linter />
</Container>

<style>
	.lead :any-link {
		text-decoration-line: underline;
		text-decoration-color: var(--accent);
	}
</style>
