<script>
	import Hero from '$lib/components/Hero.svelte'
	import Container from '$lib/components/Container.svelte'
	import Seo from '$lib/components/Seo.svelte'
	import Markdown from '$lib/components/Markdown.svelte'
</script>

<Seo title="Privacy Policy" description="No personal data is collected or stored." />

<Hero title="Privacy Policy" />

<section>
	<Container size="xl">
		<Markdown>
			<p>
				This site uses localStorage to remember your preferences (such as color scheme). This data
				never leaves your browser. Visitor statistics are collected anonymously via Counterscale and
				contain no personal information. No other data is collected or stored.
			</p>
		</Markdown>
	</Container>
</section>
