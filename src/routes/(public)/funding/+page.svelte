<script lang="ts">
	import Seo from '$lib/components/Seo.svelte'
	import Markdown from '$lib/components/Markdown.svelte'
	import Container from '$lib/components/Container.svelte'
	import Meter from '$lib/components/Meter.svelte'
	import Button from '$lib/components/Button.svelte'
	import Heading from '$components/Heading.svelte'
	import { format_money } from '$lib/format-money'
	import { format_number } from '$lib/format-number'

	let { data } = $props()
</script>

<Seo title="Sponsor Project Wallace!" description="You can support Project Wallace by becoming a GitHub sponsor!" />

<Container>
	<div class="layout">
		<header class="header">
			<Heading element="h1">
				You should <em>sponsor</em> Project Wallace.
			</Heading>
			<p>Running a popular CSS website involves a lot of work and even a bit of money.</p>
		</header>

		<section class="goal">
			<Heading element="h2">Funding goal</Heading>
			<p class="funding-target">
				{data.sponsorGoal.title} - ({format_number(data.sponsorGoal.percentComplete, {
					decimals: 1
				})}% complete)
			</p>
			<Meter max={100} value={data.sponsorGoal.percentComplete} />
			<Markdown>
				{@html data.sponsorGoal.description}
			</Markdown>

			<Button element="a" href="https://github.com/sponsors/bartveneman" rel="external" size="lg">
				Sponsor @bartveneman
			</Button>
			<p>
				<small>Sponsoring me on GitHub is the fastest and most secure way to show your support.</small>
			</p>
		</section>

		<section class="tiers">
			<Heading element="h3" size={2}>Tiers</Heading>
			<ol role="list">
				{#each data.tiers.filter((tier) => !tier.isOneTime) as tier}
					<li>
						<Heading element="h4">{tier.name}</Heading>
						<Markdown>{@html tier.descriptionHTML}</Markdown>
					</li>
				{/each}
			</ol>
		</section>

		<section class="costs">
			<Heading element="h2">Monthly costs</Heading>
			<ul role="list">
				{#each data.providers as provider}
					<li>
						<Heading element="h3">
							{provider.title} - {format_money(provider.amount)}
						</Heading>
						<Markdown>{@html provider.html}</Markdown>
					</li>
				{/each}
			</ul>
		</section>
	</div>

	<Markdown>
		<p>
			If you are looking for other ways to show your support, there are other ways to <a href="/sponsor">
				sponsor me
			</a>.
		</p>
	</Markdown>
</Container>

<style>
	.layout {
		display: grid;
		gap: var(--space-8);

		@media (min-width: 66rem) {
			grid-template-columns: 1.61803fr 1fr;
			grid-template-rows: auto auto;
			align-items: start;
			margin-block: var(--space-16);
		}
	}

	.header {
		grid-column: 1;
		grid-row: 1;
		align-self: center;
		display: grid;
		gap: var(--space-4);
		max-width: 40rem;
		margin-inline: auto;
		margin-block: var(--space-8);
		text-align: center;
		font-size: var(--size-xl);
		text-wrap: balance;
		line-height: var(--leading-base);
	}

	.goal,
	.tiers,
	.costs {
		background-color: var(--bg-200);
		padding: var(--space-8);
	}

	.goal {
		display: grid;
		gap: var(--space-4);

		@media (min-width: 66rem) {
			grid-column: 2;
			grid-row: 1;
		}
	}

	.costs {
		display: grid;
		gap: var(--space-4);

		@media (min-width: 66rem) {
			grid-column: 1;
			grid-row: 2;
		}
	}

	.tiers {
		display: grid;
		gap: var(--space-4);

		@media (min-width: 66rem) {
			grid-column: 2;
			grid-row: 2;
		}
	}

	li {
		margin-top: var(--space-2);
		padding-block: var(--space-4);
		border-top: 1px solid var(--fg-450);
	}
</style>
