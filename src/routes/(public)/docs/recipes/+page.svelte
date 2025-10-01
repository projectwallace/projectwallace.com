<script>
	import Seo from '$components/Seo.svelte'
	import MarkdownContent from '$components/MarkdownContent.svelte'
	import Heading from '$components/Heading.svelte'

	let { data } = $props()
</script>

<Seo title="Recipes - Docs" />

<article>
	<MarkdownContent>
		<h1>Recipes</h1>

		<p>
			Project Wallace lets you do a ton of cool stuff around CSS Analysis. These recipes will show you how to integrate
			with several of our tools.
		</p>
	</MarkdownContent>

	<section>
		<Heading element="h2">Available recipes</Heading>
		<ol class="categories">
			{#each data.recipes as recipe}
				<li>
					<h3>
						<a href={recipe.path}>{recipe.title}</a>
					</h3>
				</li>
			{/each}
		</ol>
	</section>
</article>

<style>
	article,
	section {
		display: grid;
		gap: var(--space-4);
	}

	ol.categories {
		display: grid;
		gap: var(--space-4);
		align-items: start;

		@media (min-width: 66rem) {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}

		& > li {
			background-color: var(--bg-200);
			padding-inline: var(--space-1);
			padding-block: var(--space-4);
			display: grid;
			gap: var(--space-4);

			@media (min-width: 44rem) {
				padding-inline: var(--space-2);
			}

			@media (min-width: 66rem) {
				padding-inline: var(--space-8);
			}
		}
	}
</style>
