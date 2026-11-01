<script lang="ts">
	import type { Theme } from '#lib/theme.ts'

	interface Props {
		theme: Theme
	}

	let { theme }: Props = $props()
</script>

<div class="theme-preview" data-theme={theme} role="img">
	<div class="window">
		<div class="nav">
			<div class="logo"></div>
			<div class="nav-item"></div>
			<div class="nav-item"></div>
			<div class="nav-item"></div>
		</div>
		<div class="main">
			<div class="panel">
				<div class="panel-title"></div>
				<div class="panel-body"></div>
			</div>
		</div>
		<div class="aside">
			<div class="panel">
				<div class="panel-title"></div>
				<div class="button"></div>
			</div>
		</div>
	</div>
</div>

<style>
	.theme-preview {
		--theme-preview-text: var(--fg-400);
		container-type: inline-size;
		contain: layout paint;
		inline-size: 100%;
		forced-color-adjust: none;

		&[data-theme='dark'] {
			color-scheme: dark;
		}

		&[data-theme='light'] {
			color-scheme: light;
		}

		&[data-theme='system'] {
			@media (prefers-color-scheme: dark) {
				color-scheme: dark;
			}

			@media (prefers-color-scheme: light) {
				color-scheme: light;
			}
		}
	}

	.window {
		background-color: var(--bg);
		aspect-ratio: 16 / 9;
		display: grid;
		gap: 5cqi;
		grid-template-areas: 'nav nav' 'main aside';
		grid-template-columns: 1fr 0.4fr;
		align-content: start;
	}

	.nav {
		grid-area: nav;
		display: flex;
		align-items: center;
		gap: 5cqi;
		background-color: var(--bg-0);
		padding-block: 4cqi;
		padding-inline: 5cqi;
		border-block-end-width: var(--border-width-1);
		border-block-end-style: var(--border-style-solid);
		border-block-end-color: var(--fg-800);
	}

	.logo,
	.nav-item {
		block-size: 3cqi;
	}

	.logo {
		inline-size: 6cqi;
		background-color: var(--accent);
	}

	.nav-item {
		inline-size: 12cqi;
		background-color: var(--theme-preview-text);
	}

	.main {
		grid-area: main;
		padding-inline-start: 5cqi;
	}

	.panel {
		padding-block: 4cqi;
		padding-inline: 2cqi;
		border-width: var(--border-width-1);
		border-style: var(--border-style-solid);
		border-color: light-dark(var(--fg-800), transparent);
		background-color: light-dark(transparent, var(--bg-200));
	}

	.panel-title {
		inline-size: 30cqi;
		block-size: 4cqi;
		background-color: var(--theme-preview-text);
	}

	.panel-body {
		block-size: 18cqi;
	}

	.aside {
		grid-area: aside;
		padding-inline-end: 5cqi;

		& .panel {
			block-size: 25cqi;
			padding-block: 3cqi;
			display: flex;
			flex-direction: column;
			justify-content: space-between;
		}

		& .panel-title {
			inline-size: 10cqi;
			block-size: 3cqi;
		}
	}

	.button {
		inline-size: 7cqi;
		block-size: 3cqi;
		background-color: var(--accent);
		align-self: end;
	}
</style>
