<script>
	import '$lib/css/prism.css'
	import Hero from '$components/Hero.svelte'
	import FormattedDate from '$components/FormattedDate.svelte'
	import Seo from '$components/Seo.svelte'
	import Markdown from '$components/Markdown.svelte'
	import Container from '$components/Container.svelte'
	import Heading from '$components/Heading.svelte'
	import avatar from '$lib/img/bartveneman.png'

	let { data } = $props()
</script>

<Seo title="{data.post.title} - Blog" description={data.post.excerpt} />

<Hero title={data.post.title}>
	<FormattedDate date={data.post.date} />
	<div class="author">
		<img class="author-avatar" src={avatar} alt="User avatar for Bart Veneman" width="25" height="25" />
		<span>Bart Veneman in</span>
		<a href="/blog">blog</a>
	</div>
</Hero>

<div class="content">
	<Container size="xl">
		<Markdown>
			{@html data.post.html}
		</Markdown>

		<a href="/blog" class="back-to-blog">Back to blog</a>
	</Container>

	<Container size="3xl" element="section">
		<Heading element="h2">Popular posts</Heading>
		<ul>
			{#each data.popular as post}
				<li data-testid="blog-post-entry" class="coverable">
					<Heading element="h3" size={2}>
						<a
							href="{post.path}?utm_campaign=Related+Blog+Posts&utm_source=website&utm_medium=Post+Footer"
							class="coverable-link"
						>
							{post.title}
						</a>
					</Heading>
					<div>
						<FormattedDate date={post.date} />
					</div>
					<p>
						{post.excerpt}
					</p>
				</li>
			{/each}
		</ul>
	</Container>
</div>

<style>
	.author {
		margin-block-start: var(--space-4);
	}

	.author-avatar {
		display: inline-block;
		margin-right: var(--space-2);
		vertical-align: middle;
		width: 25px;
		height: 25px;
	}

	.back-to-blog {
		display: inline-block;
		padding-block: var(--space-8);
		color: var(--fg-300);
	}

	.content {
		display: grid;
		gap: var(--space-24);

		@media (min-width: 66rem) {
			font-size: 1.2em;
			line-height: var(--leading-base);
		}
	}

	ul {
		display: grid;
		gap: var(--space-8);
		margin-block-start: var(--space-8);

		@media (min-width: 44rem) {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}

	li {
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
