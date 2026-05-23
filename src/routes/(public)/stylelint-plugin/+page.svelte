<script lang="ts">
	import Hero from "$components/Hero.svelte";
	import Markdown from "$components/Markdown.svelte";
	import Container from "$components/Container.svelte";

	let { data } = $props();
</script>

<Hero title="Project Wallace &mdash; Stylelint plugin" spacing="lg">
	<p class="lead">
		A stylelint plugin that checks the complexity, design tokens,
		maintainability and correctness of your CSS.
	</p>
</Hero>

<Container size="xl">
	<Markdown>
		{@html data.readme}
	</Markdown>
</Container>
