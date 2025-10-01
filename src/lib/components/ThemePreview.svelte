<script lang="ts">
	import type { Theme } from '$lib/theme'

	type Props = {
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
		container-name: theme-preview;
		container-type: inline-size;
		--theme-preview-text: var(--fg-400);
		contain: layout paint;
		width: 100%;

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
		border-bottom: 1px solid var(--fg-800);
	}

	.logo,
	.nav-item {
		height: 3cqi;
	}

	.logo {
		width: 6cqi;
		background-color: var(--accent);
	}

	.nav-item {
		width: 12cqi;
		background-color: var(--theme-preview-text);
	}

	.main {
		grid-area: main;
		padding-inline-start: 5cqi;
	}

	.panel {
		padding-block: 4cqi;
		padding-inline: 2cqi;
		border: 1px solid light-dark(var(--fg-800), transparent);
		background-color: light-dark(transparent, var(--bg-200));
	}

	.panel-title {
		width: 30cqi;
		height: 4cqi;
		background-color: var(--theme-preview-text);
	}

	.panel-body {
		height: 18cqi;
	}

	.aside {
		grid-area: aside;
		padding-inline-end: 5cqi;

		& .panel {
			height: 25cqi;
			padding-block: 3cqi;
			display: flex;
			flex-direction: column;
			justify-content: space-between;
		}

		& .panel-title {
			width: 10cqi;
			height: 3cqi;
		}
	}

	.button {
		width: 7cqi;
		height: 3cqi;
		background-color: var(--accent);
		align-self: end;
	}
</style>
