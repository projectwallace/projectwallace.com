<script>
	import Hero from '$lib/components/Hero.svelte'
	import Container from '$lib/components/Container.svelte'
	import Seo from '$lib/components/Seo.svelte'
	import Panel from '$lib/components/Panel.svelte'

	let { data } = $props()
</script>

<Seo
	title="About"
	description="A little bit of history and a couple of Frequently Asked
  Questions."
/>

<Hero title="Project Wallace">
	<p>It's analytics for CSS.</p>
	<p>
		Project Wallace is a project aimed at gaining insights in your CSS over a longer period of time. It started a couple
		of years ago as a frustration with existing CSS analyzers that only do a one-time only analysis. Now Wallace is the
		place to go for developers who want to know if their complexicity has increased or for a designer who wants to know
		if all the correct colors and fonts are being used.
	</p>
</Hero>

<Container>
	<section>
		<h2 class="font-heading text-white text-4xl mb-5">Frequently asked questions</h2>
		<ol class="faqs">
			{#each data.faqs as faq}
				<Panel element="li" class="md:p-8 border-t-2 border-teal-400">
					<h3 class="font-bold text-lg leading-snug block mb-4">
						{@html faq.title}
					</h3>
					<div class="leading-relaxed content">
						{@html faq.content}
					</div>
				</Panel>
			{/each}
		</ol>
	</section>
</Container>

<style>
	.faqs {
		display: grid;
		align-items: start;
		gap: 1.5rem;
		grid-template-columns: repeat(auto-fill, minmax(30ch, 1fr));
	}

	p {
		margin: 1rem;
	}
</style>
