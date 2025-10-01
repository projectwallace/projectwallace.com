<script>
	import Seo from '$components/Seo.svelte'
	import MarkdownContent from '$components/MarkdownContent.svelte'
	import Heading from '$components/Heading.svelte'
	import Markdown from '$components/Markdown.svelte'

	let { data } = $props()
</script>

<Seo title="Metrics - Docs" />

<article>
	<MarkdownContent>
		<h1>Metrics</h1>

		<p>
			All you need to know about the variety of metrics that Project Wallace generates about your CSS. Here is a
			top-level list of all sections that the CSS Analyzer provides:
		</p>
	</MarkdownContent>

	<ol class="categories">
		{#each data.allGroups as group}
			<li>
				<Heading element="h2" size={3} id={group.slug}>
					<a href={`/docs/metrics#${group.slug}`}>{group.title}</a>
				</Heading>
				<Markdown>
					{@html group.html}
				</Markdown>
				<ol class="topics">
					{#each data.groupedBySection[group.id] as metric}
						<li>
							<a href={metric.path}>
								{metric.title}
							</a>
						</li>
					{/each}
				</ol>
			</li>
		{/each}
	</ol>
</article>

<style>
	ol.categories {
		display: grid;
		gap: var(--space-4);
		align-items: start;
		margin-block-start: var(--space-8);

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

	.topics {
		list-style-type: square;
		margin-inline-start: var(--space-4);

		& li::marker {
			color: var(--fg-300);
		}

		a {
			display: block;
			padding: var(--space-1);

			&:hover,
			&:focus {
				text-decoration: underline;
			}
		}
	}
</style>
