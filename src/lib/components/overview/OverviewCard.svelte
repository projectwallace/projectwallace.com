<script lang="ts">
	import { Panel, Header } from '$components/Panel'
	import Heading from '$components/Heading.svelte'
	import type { Snippet } from 'svelte'

	interface Props {
		title: string
		href: string
		link_text?: string
		children?: Snippet
	}

	let { title, href, link_text = 'Full report', children }: Props = $props()
</script>

<Panel>
	<Header>
		<Heading element="h2" size={3}>{title}</Heading>
		<a class="card-link" {href}>{link_text} &rarr;</a>
	</Header>
	<dl class="overview-stats">
		{@render children?.()}
	</dl>
</Panel>

<style>
	.card-link {
		font-size: var(--size-sm);
		font-weight: var(--font-medium);
		white-space: nowrap;
	}

	.overview-stats {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(8rem, 1fr));
		gap: var(--space-4);
	}
</style>
