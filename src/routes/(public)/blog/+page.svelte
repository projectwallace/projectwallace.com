<script>
	import Hero from '$components/Hero.svelte'
	import FormattedDate from '$components/FormattedDate.svelte'
	import Seo from '$components/Seo.svelte'
	import Icon from '$components/Icon.svelte'
	import Container from '$components/Container.svelte'
	import Heading from '$components/Heading.svelte'

	let { data } = $props()
</script>

<Seo
	title="Blog"
	description="You want to learn more about the workings of Wallace? You’ve come to the right place! Product updates, in depth analysis and more."
/>

<Hero title="Blog">
	<Container size="xl">
		<p>
			You want to learn more about the workings of Wallace? You’ve come to the right place! Product updates, in depth
			analysis and more.
		</p>

		<a data-testid="rss-link" class="link-to-rss" href="/blog/feed.xml">
			<Icon name="rss" size={14} />
			<span>Subscribe to the RSS feed</span>
		</a>
	</Container>
</Hero>

<Container size="xl">
	<ol reversed>
		{#each data.posts as post (post.path)}
			<li class="coverable">
				<article>
					<Heading element="h2">
						<a href={post.path} class="coverable-link">
							{post.title}
						</a>
					</Heading>
					<div>
						<FormattedDate date={post.date} />
					</div>
					{#if post.excerpt}
						<p>
							{post.excerpt}
						</p>
					{/if}
				</article>
			</li>
		{/each}
	</ol>
</Container>

<style>
	.link-to-rss {
		display: flex;
		align-items: baseline;
		justify-content: center;
		margin-top: 1.5rem;
		gap: var(--space-2);

		& :global(.icon) {
			fill: var(--teal-400);
		}
	}

	ol {
		display: grid;
		gap: var(--space-8);
	}

	article {
		display: grid;
		gap: var(--space-2);
		background-color: var(--bg-200);
		padding-block: var(--space-12);
		padding-inline: var(--space-16);

		& :global(time) {
			color: var(--fg-300);
			font-size: var(--size-sm);
		}

		& p {
			font-size: var(--size-lg);
		}
	}
</style>
