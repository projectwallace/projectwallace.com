<script lang="ts">
	type NavItem = {
		id: string
		title: string
		items?: NavItem[]
	}

	import { nav as defaultNav } from './nav'

	interface Props {
		nav?: NavItem[]
		scroll_spy?: boolean
	}

	let { nav = defaultNav, scroll_spy = false }: Props = $props()

	let activeIds = $state<Set<string>>(new Set())

	$effect(() => {
		if (!scroll_spy || nav.length === 0) return

		// Get all section IDs from nav
		const sectionIds = new Set<string>()
		nav.forEach((item) => {
			sectionIds.add(item.id)
			if (item.items) {
				item.items.forEach((subItem) => sectionIds.add(subItem.id))
			}
		})

		// Track which sections are currently intersecting
		const intersectingIds = new Set<string>()

		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					const id = entry.target.id
					if (entry.isIntersecting) {
						intersectingIds.add(id)
					} else {
						intersectingIds.delete(id)
					}
				})

				// Update active IDs (the topmost intersecting section)
				activeIds = new Set(intersectingIds)
			},
			{
				rootMargin: '50px 0px 50px 0px',
				threshold: 0.05
			}
		)

		// Observe all sections
		sectionIds.forEach((id) => {
			const element = document.getElementById(id)
			if (element) {
				observer.observe(element)
			}
		})

		return () => {
			observer.disconnect()
		}
	})

	function on_select(event: Event) {
		let select = event.target as HTMLOptionElement
		// eslint-disable-next-lint eslint-plugin-unicorn/prefer-query-selector
		let section = document.getElementById(select.value)
		if (section) {
			section.scrollIntoView({ block: 'start' })
		}
	}
</script>

<nav aria-labelledby="report-nav-title">
	<div id="report-nav-title" class="title">Navigate this page</div>

	<div class="compact">
		<label for="report-nav" aria-labelledby="report-nav-title"></label>
		<select name="report-nav" id="report-nav" onchange={on_select}>
			{#each nav as { title, items }}
				{#if items}
					<optgroup label={title}>
						{#each items as item}
							<option value={item.id}>{item.title}</option>
						{/each}
					</optgroup>
				{:else}
					<option value={title}>{title}</option>
				{/if}
			{/each}
		</select>
	</div>

	<div class="loose" aria-labelledby="report-nav-title">
		{#each nav as { id, title, items }}
			<a href="#{id}" class="parent" aria-current={activeIds.has(id) ? 'true' : undefined}>
				{title}
			</a>
			{#if items}
				{#each items as item}
					<a href="#{item.id}" class="child" aria-current={activeIds.has(item.id) ? 'true' : undefined}>
						{item.title}
					</a>
				{/each}
			{/if}
		{/each}
	</div>
</nav>

<style>
	nav {
		--py: 0.35rem;
		--px: var(--space-3);
	}

	.compact {
		padding: var(--py) var(--px);
		position: sticky;
		top: 0;
		right: 0;
		left: 0;
	}

	.loose {
		display: none;
		max-height: 90vb;
	}

	@media (min-width: 44rem) {
		.compact {
			display: none;
		}

		.loose {
			display: block;
		}
	}

	.title {
		font-weight: var(--font-bold);
		color: var(--fg-100);
		margin: var(--space-2) var(--px);
	}

	select {
		background-color: var(--bg-200);
		color: var(--fg-200);
		padding: var(--py) var(--px);
		width: 100%;
	}

	.parent,
	.child {
		display: block;
		position: relative;
		line-height: var(--leading-base);

		&::after,
		&::after {
			content: '';
			position: absolute;
			top: 0;
			right: 0;
			bottom: 0;
			left: 0;
			border: 1px dotted var(--accent-400);
			opacity: 0;
		}

		&:hover::after,
		&:hover::after {
			opacity: 1;
		}

		&[aria-current='true'],
		&[aria-current='true'] {
			&::before {
				width: 3px;
				background-color: var(--bg-700);
			}
			&::after {
				border-color: var(--accent-400);
			}

			color: var(--accent-400);
		}
	}

	.parent {
		padding: var(--py) var(--px);
		font-weight: var(--font-bold);
	}

	.child {
		padding: var(--py) var(--px) var(--py) var(--space-7);

		&::before {
			content: '';
			position: absolute;
			top: 0;
			bottom: 0;
			left: var(--px);
			background-color: var(--fg-450);
			width: 1px;
		}
	}
</style>
