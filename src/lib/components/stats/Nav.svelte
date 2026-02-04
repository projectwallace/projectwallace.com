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

		// Collect all section IDs from nav in order
		const sectionIds: string[] = []
		nav.forEach((item) => {
			sectionIds.push(item.id)
			if (item.items) {
				item.items.forEach((subItem) => sectionIds.push(subItem.id))
			}
		})

		function update() {
			// Find the last heading that has scrolled past the top of the viewport
			let currentId: string | undefined
			for (const id of sectionIds) {
				const el = document.getElementById(id)
				if (el && el.getBoundingClientRect().top <= 100) {
					currentId = id
				}
			}

			const next = new Set<string>()
			if (currentId) {
				next.add(currentId)
			}
			activeIds = next
		}

		window.addEventListener('scroll', update, { passive: true })
		update()

		return () => {
			window.removeEventListener('scroll', update)
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
	}

	.loose {
		display: none;
	}

	@media (min-width: 44rem) {
		.compact {
			display: none;
		}

		.loose {
			display: block;
			max-height: calc(95vb - var(--py));
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
			color: light-dark(var(--accent-700), var(--accent-500));

			&::before {
				width: 3px;
				background-color: var(--bg-700);
			}

			&::after {
				border-color: var(--accent-400);
			}
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
