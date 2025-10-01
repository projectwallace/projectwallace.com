<script>
	import Hero from '$components/Hero.svelte'
	import Icon from '$components/Icon.svelte'
	import Container from '$components/Container.svelte'
	import Seo from '$components/Seo.svelte'
	import Heading from '$components/Heading.svelte'

	let { data } = $props()
</script>

<Seo
	title="Open Source Software"
	description="Project Wallace's goal is to create software to make maintaining
  CSS easier."
	image="https://www.projectwallace.com/img/opengraph/og-oss.png"
/>

<Hero title="Open Source Software">
	<p>Project Wallace's goal is to create software to make maintaining CSS easier.</p>
</Hero>

<Container>
	<ol class="projects">
		{#each data.projects as project}
			<li class="project">
				<article>
					<div class="icon">
						{#if project.icon}
							{@html project.icon}
						{:else}
							<svg viewBox="0 0 15 15" xmlns="http://www.w3.org/2000/svg" />
						{/if}
					</div>
					<div class="content">
						<Heading element="h2" size={3}>
							<a href={project.url} rel="external" class="coverable-link">
								{project.title}
							</a>
						</Heading>
						<p>{project.description}</p>
						<div class="github-link">
							<Icon name="github" size={16} />
							{project.repository}
						</div>
					</div>
				</article>
			</li>
		{/each}
	</ol>
</Container>

<style>
	.projects {
		display: grid;
		gap: var(--space-4);
		grid-template-columns: repeat(auto-fit, minmax(var(--space-72), 1fr));
	}

	.project {
		background-color: var(--bg-200);
		box-shadow: var(--shadow);
		border-top: 2px solid var(--accent-400);
		position: relative;
	}

	.icon {
		padding-inline: var(--space-16);
		padding-block: var(--space-8);
		margin-inline: auto;
		border-bottom: 1px solid var(--fg-450);
	}

	.content {
		padding: var(--space-4);
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		height: 100%;
		gap: var(--space-4);
	}

	.github-link {
		display: flex;
		align-items: center;
		font-size: var(--size-sm);
		color: var(--fg-300);
		gap: var(--space-2);
	}
</style>
