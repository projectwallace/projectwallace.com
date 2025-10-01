<script lang="ts">
	import { fade } from 'svelte/transition'
	import Container from '$lib/components/Container.svelte'
	import Seo from '$lib/components/Seo.svelte'
	import Hero from '$lib/components/Hero.svelte'
	import Meter from '$lib/components/Meter.svelte'
	import Label from '$lib/components/Label.svelte'
	import FormGroup from '$lib/components/FormGroup.svelte'
	import Button from '$lib/components/Button.svelte'
	import { all as units } from '$lib/css-units'
	// @ts-expect-error No type definitions for importing images
	import Image from './og-image.png?w=1200'
	import Heading from '$components/Heading.svelte'

	let interaction_started = false
	let currentGuess = $state('')
	let guessed: string[] = $state([]) // TODO: should be a subset type of `units`

	function checkGuess(event: SubmitEvent) {
		event.preventDefault()

		let guess = currentGuess.toLowerCase().trim()

		if (!interaction_started) {
			interaction_started = true
		}

		if (guessed.includes(guess)) return

		if (guess === '!important') {
			guessed = [...units]
			currentGuess = ''
			return
		}

		if (units.includes(guess)) {
			guessed = [guess, ...guessed]
			currentGuess = ''
		}
	}

	function reset() {
		guessed = []
	}
</script>

<Seo title="CSS Units memory game" description="Test how many CSS units you can remember." image={Image} />

<Hero title="CSS Units">
	<Container size="xl">
		<p>Which CSS units can you remember?</p>

		<form action="" method="GET" onsubmit={checkGuess} class="form">
			<FormGroup>
				<Label for="guess-input">Unit</Label>
				<input
					type="text"
					name="guess-input"
					id="guess-input"
					autocomplete="off"
					placeholder="px"
					required
					class="input"
					bind:value={currentGuess}
				/>
			</FormGroup>
			<Button size="lg">Guess</Button>
		</form>
	</Container>
</Hero>

<Container>
	<Container size="xl">
		<div class="status">
			{#if guessed.length === units.length}
				<Heading element="div" size={1} data-testid="success-message">Congratulations!</Heading>
				<Button onclick={reset} data-testid="game-reset">Start over</Button>
				<p>But, honestly, why?</p>
			{:else if guessed.length > 0}
				<p>Keep going! Only {units.length - guessed.length} more to go&hellip;</p>
			{/if}
		</div>

		{#if guessed.length !== 0}
			<div class="progress" in:fade>
				<Meter max={units.length} value={guessed.length} />
				<span data-testid="progress-count">
					{guessed.length} / {units.length}
				</span>
			</div>

			<ol class="guesses" in:fade data-testid="guesses">
				{#each guessed as guess (guess)}
					<li class="guess" data-testid="guess">
						<code>{guess}</code>
					</li>
				{/each}
			</ol>
		{/if}
	</Container>

	{#if guessed.length !== 0}
		<section id="share" class="share" in:fade>
			<Heading element="h2">Share your score</Heading>
			<blockquote>
				I just scored {guessed.length} out of {units.length} units on Project Wallace's CSS Units game!
			</blockquote>
			<Button
				element="a"
				href="https://bsky.app/intent/compose?text={encodeURIComponent(
					`I just scored ${guessed.length} out of ${units.length} units on Project Wallace's CSS Units game!\n\nhttps://www.projectwallace.com/css-units-game`
				)}"
				rel="external"
				target="_blank"
				variant="secondary"
				size="lg"
			>
				Share on Bluesky
			</Button>
		</section>
	{/if}

	<Container size="xl">
		<section class="acknowledgements">
			<Heading element="h2">Acknowledgements</Heading>
			<p>
				This game is inspired by the
				<a href="https://codepen.io/plfstr/full/zYqQeRw" rel="external"> HTML memory test </a>
				by <a href="https://codepen.io/plfstr" rel="external">plfstr</a> and
				<a href="https://nerdy.dev/new-relative-units-ric-rex-rlh-and-rch" rel="external">
					Adam Argyle&rsquo;s blog post
				</a>
				about new CSS units. Units are taken from
				<a href="https://github.com/csstree/csstree/blob/master/lib/lexer/units.js" rel="external">CSSTree</a> (but no peeking!).
			</p>
		</section>
	</Container>
</Container>

<style>
	.form {
		display: grid;
		grid-template-columns: 1fr max-content;
		gap: var(--space-4);
		align-items: end;
		margin-top: var(--space-8);
		width: 100%;
		text-align: left;
	}

	.status {
		text-align: center;
		display: grid;
		gap: var(--space-8);
	}

	.progress {
		display: flex;
		gap: var(--space-4);
		align-items: center;
		justify-content: space-between;
		margin-block-start: var(--space-4);
		white-space: nowrap;
	}

	.guesses {
		margin-top: var(--space-8);
		list-style-type: decimal;
		list-style-position: inside;
		display: grid;
		gap: var(--space-2);
	}

	.guess {
		background-color: var(--bg-200);
		padding-inline: var(--space-2);
	}

	.share {
		background-color: var(--bg-200);
		padding: var(--space-4);
		text-align: center;
		box-shadow: var(--shadow-lg);
		margin-block: var(--space-16);
		display: grid;
		gap: var(--space-4);
		justify-items: center;

		blockquote {
			font-size: var(--size-lg);
			font-style: italic;

			&::before {
				content: open-quote;
			}

			&::after {
				content: close-quote;
			}
		}
	}

	.acknowledgements {
		margin-block: var(--space-16);
		text-align: center;
		display: grid;
		gap: var(--space-4);

		a {
			text-decoration: underline;
		}
	}
</style>
