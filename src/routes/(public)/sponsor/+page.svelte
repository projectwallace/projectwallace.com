<script>
	import Hero from '$components/Hero.svelte'
	import Icon from '$components/Icon.svelte'
	import Container from '$components/Container.svelte'
	import Seo from '$components/Seo.svelte'
	import Button from '$components/Button.svelte'

	let { data } = $props()
</script>

<Seo
	title="Sponsor Project Wallace"
	description="Project Wallace can not exist without your support!"
/>

<Hero title="Sponsor Project Wallace">
	<p class="leading-snug">
		Maintaining a project the size of Wallace takes a lot of time and effort. There are many repositories to keep
		up-to-date, documentation to write, and blogs to post. With your help, Project Wallace can keep on going!
	</p>
</Hero>

<Container>
	<article class="py-16 mt-16 max-w-xl mx-auto">
		<div class="md:flex items-start justify-between">
			<div class="lg:mr-16 md:w-1/2 lg:w-2/5">
				<h2 class="font-heading text-2xl md:text-3xl lg:text-4xl mb-5 text-white">Ways to sponsor Project Wallace</h2>

				<div class="max-w-sm leading-relaxed md:text-lg xl:text-2xl">
					<p>
						Apart form becoming a PRO user, you can sponsor me (Bart Veneman) and Project Wallace in a variety of ways.
						Pick the one that suits
						<i>you</i>
						best.
					</p>
					<Button element="a" size="lg" class="mt-8" href="https://github.com/sponsors/bartveneman" rel="external">
						Become a sponsor!
					</Button>
				</div>
			</div>

			<aside
				class="mt-8 md:mt-0 py-4 px-4 lg:py-6 lg:px-6 xl:py-12 xl:px-8
				bg-gray-100 text-gray-800 shadow-lg md:w-1/2 lg:w-2/5 border-yellow-400
				border-t-4"
			>
				<p class="text-lg">Here are some options to sponsor Project Wallace:</p>
				<ul class="mt-8">
					<li>
						<a class="block" href="https://github.com/sponsors/bartveneman" rel="external">
							<h3 class="font-bold text-xl text-gray-600">GitHub Sponsors</h3>
							<p class="mt-1">Sponsor @bartveneman (creator of Project Wallace) on GitHub.</p>
							<footer class="mt-1 text-sm text-gray-600 flex justify-between">
								<span>@bartveneman</span>
								<span>😎</span>
							</footer>
						</a>
					</li>
					<li class="mt-4 pt-4 border-t border-gray-200">
						<a class="block" href="https://www.paypal.me/bartveneman" rel="external">
							<h3 class="font-bold text-xl text-gray-600">PayPal</h3>
							<p class="mt-1">One-time donation</p>
							<footer class="flex justify-between mt-1 text-sm text-gray-600">
								<span>$3 buys me a good cup of coffee</span>
								<span class="font-bold">☕️</span>
							</footer>
						</a>
					</li>
				</ul>
			</aside>
		</div>
	</article>

	<article class="py-16 mt-16 max-w-xl mx-auto">
		<div class="md:flex items-start justify-between">
			<div class="lg:mr-16 md:w-1/2 lg:w-2/5">
				<h2 class="font-heading text-2xl md:text-3xl lg:text-4xl mb-5 text-white">Support many open-source projects</h2>

				<div class="max-w-sm leading-relaxed md:text-lg xl:text-2xl">
					<p>
						Pretty much all code of Project Wallace is open source and available
						<a href="https://github.com/projectwallace" class="font-bold text-gray-100 underline"> on GitHub </a>
						. Star these projects, subscribe to updates, report bugs and help implement new features!
					</p>
					<p>
						With your support, Project Wallace's repositories will gain visibility so more people can enjoy the benefits
						of using CSS analysis tools.
					</p>
				</div>

				<Button element="a" size="lg" class="mt-8" href="https://github.com/sponsors/bartveneman" rel="external">
					Become a GitHub sponsor
				</Button>
			</div>

			<aside
				class="mt-8 md:mt-0 py-4 px-4 lg:py-6 lg:px-6 xl:py-12 xl:px-8
				bg-gray-100 text-gray-800 shadow-lg md:w-1/2 lg:w-2/5 border-t-4
				border-black"
			>
				<span class="block text-center text-gray-300">
					<Icon name="github" size={70} />
				</span>
				<p class="text-lg mt-5">These are some of the most important libraries that keep Project Wallace going.</p>
				<ul class="mt-8">
					{#each data.repositories as repo}
						<li class="mt-4 pt-4 border-t border-gray-200">
							<a class="block" href={repo.url}>
								<h3 class="font-bold text-xl text-gray-600">{repo.name}</h3>
								<p class="mt-1">{repo.description}</p>
								<footer class="flex justify-between mt-1 text-sm text-gray-600">
									<span>{repo.nameWithOwner}</span>
									<span class="font-bold">⭐️ {repo.stargazerCount}</span>
								</footer>
							</a>
						</li>
					{/each}
				</ul>
			</aside>
		</div>
	</article>

	<article class="py-16 mt-16 max-w-xl mx-auto">
		<div class="md:flex items-start justify-between">
			<div class="lg:mr-16 md:w-1/2 lg:w-2/5">
				<h2 class="font-heading text-2xl md:text-3xl lg:text-4xl mb-5 text-white">Follow news and updates</h2>

				<div class="max-w-sm leading-relaxed md:text-lg xl:text-2xl">
					<p>
						All new features are shared via
						<a href="blog" class="font-bold text-gray-100 underline"> the blog </a>
						and
						<a class="font-bold text-gray-100 underline" href="https://bsky.app/profile/projectwallace.com">
							Bluesky
						</a>
						. Subscribe to the
						<a href="blog/feed.xml" class="font-bold text-gray-100 underline"> RSS feed </a>
						and follow
						<a class="font-bold text-gray-100 underline" href="https://bsky.app/profile/projectwallace.com">
							@projectwallace.com
						</a>
						on Bluesky to never miss an update!
					</p>
				</div>
			</div>

			<aside
				class="mt-8 md:mt-0 py-4 px-4 lg:py-6 lg:px-6 xl:py-12 xl:px-8
				bg-gray-100 text-gray-800 shadow-lg md:w-1/2 lg:w-2/5 border-t-4
				border-teal-400"
			>
				<p class="text-lg">You can find Project Wallace on the internet:</p>
				<ul class="mt-8">
					<li>
						<a class="block" href="https://github.com/projectwallace">
							<h3 class="font-bold text-xl text-gray-600">GitHub</h3>
							<footer class="flex justify-between mt-1 text-sm text-gray-600">
								<span>@projectwallace</span>
								<span class="font-bold">{data.totalStars}+ stars</span>
							</footer>
						</a>
					</li>
					<li class="mt-4 pt-4 border-t border-gray-200">
						<a class="block" href="https://bsky.app/profile/projectwallace.com">
							<h3 class="font-bold text-xl text-gray-600">Bluesky</h3>
							<footer class="flex justify-between mt-1 text-sm text-gray-600">
								<span>@projectwallace.com</span>
								<span class="font-bold">53 followers</span>
							</footer>
						</a>
					</li>
					<li class="mt-4 pt-4 border-t border-gray-200">
						<a class="block" href="blog">
							<h3 class="font-bold text-xl text-gray-600">Project Wallace Blog</h3>
							<footer class="mt-1 text-sm text-gray-600">
								<span>probably has subscribers</span>
							</footer>
						</a>
					</li>
				</ul>
			</aside>
		</div>
	</article>
</Container>
