<script lang="ts">
	import type { Snippet } from 'svelte'

	interface Props {
		class?: string
		children?: Snippet
	}

	let { class: className = '', children }: Props = $props()
</script>

<div class="[ markdown ] {className}">
	{@render children?.()}
</div>

<style>
	:global(.markdown :is(h1, h2, h3, h4)) {
		line-height: var(--leading-none);
	}

	:global(.markdown :is(h1, h2, h3, h4) :any-link) {
		text-decoration: none;
		color: inherit;
	}

	:global(.markdown h1) {
		font-size: var(--size-4xl);
	}

	:global(.markdown h2) {
		font-size: var(--size-2xl);
		margin-top: var(--space-16);
		font-weight: var(--font-bold);
	}

	:global(.markdown h3) {
		font-size: var(--size-xl);
		margin-top: var(--space-12);
		font-weight: var(--font-bold);
	}

	:global(.markdown h4) {
		font-size: var(--size-base);
		margin-top: var(--space-12);
		font-weight: var(--font-medium);
	}

	:global(.markdown blockquote) {
		background-color: var(--bg-200);
		padding: var(--space-4) var(--space-12);
		max-width: 50ch;
		box-shadow: var(--shadow);
		border-left: 4px solid var(--accent);
	}

	:global(.markdown p) {
		line-height: var(--leading-relaxed);
		max-width: 60ch;
	}

	:global(.markdown svg[role='img']) {
		max-width: 80ch;
	}

	:global(.markdown math) {
		display: block;
		text-align: center;
		font-size: var(--size-lg);
		color: var(--fg-100);
		font-family: 'Cantata One';
		line-height: var(--leading-relaxed);
	}

	:global(.markdown strong) {
		font-style: normal;
		font-weight: var(--font-bold);
		color: var(--fg-100);
	}

	:global(.markdown em) {
		font-style: italic;
	}

	:global(.markdown :is(p, pre, img, table, ol, ul, blockquote, figure, iframe, math, .bar-chart)) {
		margin-block-start: var(--space-6);

		@media (height > 44rem) {
			margin-block-start: var(--space-12);
		}
	}

	:global(.markdown pre) {
		background-color: var(--bg-200);
		padding: 1rem 0.5rem;
		overflow-x: auto;
		max-width: 100%;
		-webkit-overflow-scrolling: touch;
		color: var(--fg-100);
		word-break: break-all;
		white-space: pre;
		tab-size: 2;
		font-size: 1em;
		border: 1px solid var(--fg-700);
	}

	@media (min-width: 44rem) {
		:global(.markdown pre) {
			padding: 0.75rem 1rem;
			margin-right: -1rem;
			margin-left: -1rem;
		}
	}

	:global(.markdown pre code) {
		background-color: transparent;
		padding: 0;
	}

	:global(.markdown ul) {
		line-height: var(--leading-relaxed);
	}

	:global(.markdown li) {
		margin-top: 0.75rem;
		max-width: 66ch;
	}

	:global(.markdown ul li) {
		list-style: square;
		margin-left: 2.25rem;
	}

	:global(.markdown ol li) {
		list-style: decimal;
		margin-left: 3rem;
	}

	:global(.markdown ul li::marker) {
		color: var(--accent-500);
	}

	:global(.markdown ol li::marker) {
		color: var(--fg-400);
		font-weight: var(--font-bold);
		font-family: var(--font-mono);
		font-size: var(--size-base);
	}

	:global(.markdown :where(:any-link)),
	:global(.markdown :where(:any-link code)) {
		color: light-dark(var(--accent-800), var(--accent-300));
		text-decoration: underline;
		text-decoration-color: light-dark(var(--accent-700), var(--accent-300));
		font-size: 1em;
	}

	:global(.markdown table) {
		--cell-spacing: 0.75rem;
		border-spacing: 0;
		width: 100%;
		border-top: 0.125rem solid var(--fg-300);
		box-shadow: var(--shadow);
		font-size: 0.8em;
	}

	:global(.markdown th) {
		text-align: left;
		font-family: var(--font-body);
		text-transform: uppercase;
		font-size: 0.8em;
		font-weight: bold;
		padding: var(--cell-spacing);
	}

	:global(.markdown tbody tr:nth-child(2n + 1)) {
		background-color: var(--uneven-tr-bg);
	}

	:global(.markdown td) {
		padding: var(--cell-spacing);
	}

	:global(.markdown :is(th, td):not(:first-child)) {
		text-align: right;
	}

	:global(.markdown img) {
		box-shadow: var(--shadow);
		border: 1px solid var(--fg-700);
	}

	:global(.markdown code) {
		font-size: 0.8em;
	}

	:global(.markdown :is(p, li, figcaption) code) {
		display: inline-block;
		margin-right: 0.25ch;
		margin-left: 0.25ch;
		color: var(--highlight-name);
		background-color: var(--bg-200);
	}

	:global(.markdown pre code) {
		color: var(--fg-200);
	}

	:global(.markdown aside) {
		margin: var(--space-16) 0;
	}

	:global(.markdown aside):not([class]) {
		border: 2px solid var(--accent-800);
		padding: var(--space-6) var(--space-5);
	}

	:global(.markdown :is(aside, blockquote) > :first-child) {
		margin-top: 0;
	}

	:global(.markdown :is(aside, blockquote) > :last-child) {
		margin-bottom: 0;
	}

	:global(.markdown figcaption) {
		text-align: center;
		font-size: var(--size-sm);
		margin-top: var(--space-2);
	}

	:global(.markdown hr) {
		border-top: 1px solid var(--gray-500);
		margin: var(--space-16) 0;
	}
</style>
