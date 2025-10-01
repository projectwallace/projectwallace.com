<script lang="ts">
	import '$lib/css/prism.css'
	import { page } from '$app/state'
	import { MediaQuery } from 'svelte/reactivity'
	import Icon from '$components/Icon.svelte'
	import Container from '$components/Container.svelte'

	let { data, children } = $props()

	let large = new MediaQuery('(min-width: 44rem)', true)
	let menuOpen = $state(large.current)

	$effect(() => {
		if (large.current) {
			menuOpen = true
		}
	})
</script>

<Container>
	<div class="layout">
		<div class="content">
			{@render children?.()}
		</div>

		<aside>
			<button onclick={() => (menuOpen = !menuOpen)}>
				<Icon name="menu" size={15} />
				<span>
					{#if menuOpen}Hide menu{:else}Show menu{/if}
				</span>
			</button>

			{#if menuOpen}
				<ol class="level-1" role="list">
					<li>
						<a
							href="/docs/metrics"
							aria-current={page.url.pathname.includes('metrics') ? 'true' : undefined}
							class="section-title"
						>
							Metrics
						</a>
						<ol>
							{#each data.allGroups as group}
								<li>
									<a
										href={`/docs/metrics#${group.slug}`}
										class="link"
										aria-current={page.params.slug?.startsWith(group.slug) ? 'page' : undefined}
									>
										{group.title}
									</a>
								</li>
							{/each}
						</ol>
					</li>
					<li>
						<a
							href="/docs/recipes"
							aria-current={page.url.pathname.includes('recipes') ? 'true' : undefined}
							class="section-title"
						>
							Recipes
						</a>
						<ol>
							{#each data.allRecipes as recipe}
								<li>
									<a
										href={recipe.path}
										class="link"
										aria-current={page.url.pathname.endsWith(recipe.path) ? 'page' : undefined}
									>
										{recipe.title}
									</a>
								</li>
							{/each}
						</ol>
					</li>
					<li>
						<a
							href="/docs/css-scraper"
							class="section-title"
							aria-current={page.url.pathname.includes('css-scraper') ? 'true' : undefined}>CSS Scraper Agent</a
						>
					</li>
				</ol>
			{/if}
		</aside>
	</div>
</Container>

<style>
	.layout {
		display: grid;
		grid-template-columns: 1fr;

		@media (min-width: 44rem) {
			grid-template-columns: max-content minmax(0, 1fr);
		}
	}

	aside {
		order: 1;
		border-color: var(--fg-600);
		border-style: solid;
		border-width: 0;
		padding-block: var(--space-6);
		display: grid;
		gap: var(--space-4);
		align-items: start;

		@media (min-width: 44rem) {
			border-width: 0 1px 0 0;
		}
	}

	.content {
		order: 2;
		display: grid;
		gap: var(--space-4);

		@media (min-width: 44rem) {
			padding-block: var(--space-8);
			padding-inline: var(--space-8);
		}
	}

	button {
		display: flex;
		align-items: baseline;
		gap: var(--space-2);
		background-color: var(--bg-200);
		color: var(--fg-300);
		font-weight: var(--font-medium);
		letter-spacing: var(--tracking-wider);
		padding-inline: var(--space-4);
		padding-block: var(--space-3);

		@media (min-width: 44rem) {
			display: none;
		}
	}

	[role='list'].level-1 {
		display: grid;
		gap: var(--space-4);
	}

	.section-title {
		display: block;
		text-transform: uppercase;
		font-weight: var(--font-bold);
		letter-spacing: var(--tracking-wider);
		margin-bottom: var(--space-3);
		padding-left: var(--space-5);

		&:hover,
		&:focus {
			background-color: var(--bg-200);
		}

		&[aria-current] {
			color: var(--accent-500);
		}
	}

	.link {
		display: block;
		padding-inline: var(--space-5);
		padding-block: var(--space-1);
		border-left: var(--space-1) solid transparent;
		text-decoration: none;

		&:hover,
		&:focus {
			background-color: var(--bg-200);
			border-color: var(--teal-500);
			color: var(--accent-700);
		}

		&[aria-current] {
			color: var(--teal-500);
			border-color: var(--teal-500);
		}
	}
</style>
