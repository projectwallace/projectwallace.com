import type { CSSOrigin } from '$lib/css-origins'
import { test, expect } from '../../../../tests/fixtures'

const NERDY_DEV_FIXTURE = `
@layer base.props {
	:root {
		--indigo-7: #4263eb;
	}

	@media (prefers-color-scheme: dark) {
		:root {
			--shadow-color: 220 40% 2%;
			--shadow-strength: 25%;
		}
	}
}

@layer base.normalize {
	:where(html) {
		--link: var(--indigo-7);
	}
}

@layer base.theme {
	:where([data-theme=light], .light, .light-theme) {
		--link: var(--indigo-7);
	}
}

@layer base.theme {
	:where([data-theme=dark], .dark, .dark-theme) {
		--link: var(--indigo-7);
	}
}

@layer base.utilities {
	.center-center {
		flex-direction: column;
		justify-content: center;
	}
}

@layer base.containers {
	cq-document-vi {
		container-type: inline-size;
		container-name: cq-document-vi;
	}
}

@layer base.nojs {
	body:not([nojs]) .nojs {
		display: none;
	}

	[nojs] {
		& .ThemeSwitch,
		& .share-button {
			display: none;
		}

		& .PostItem {
			cursor: auto;
		}
	}
}

@layer components.toast {
	.gui-toast-group {
		display: grid;
	}
}

@layer components.markdown {
	p:empty {
		display: none;
	}
}

@layer components.syntax {
	:root {
		--_syntax-color-1: var(--neon-pink);
	}
}

@layer components.quote {
	q {
		background-color: var(--surface-1);
	}
}

@layer components.glitch {
	@media (prefers-reduced-motion: no-preference) {
		:not([scroll-direction=down]) .gui-skull:not(:hover) {
			animation: cyberpunk-glitch 7s step-end infinite, skew-glitch 7s step-end infinite;
		}
	}
}

@layer components.glitch {
	@keyframes skew-glitch {
		0% {
			transform: skew(83deg, 2deg) scaley(.15);
		}
	}
}

@layer components.fresh {
	.BlogDetail {
		align-items: start;
	}
}

@layer components.fresh {
	.BlogHero {
		display: flex;
	}
}

@layer components.fresh {
	.PostList {
		display: flex;
	}
}

@layer components.fresh {
	.TableOfContents {
		display: none;
	}
}

@layer components.fresh {
	.Tags {
		gap: var(--size-2);
	}
}

@layer components.fresh {
	.ThemeSwitch {
		--size: 40px;
	}
}

@layer components.fresh {
	.TopicsAsideMobile {
		appearance: none;
	}
}

@layer components.fresh {
	@media (prefers-reduced-motion: no-preference) {
		.TopicsAside {
			view-transition-name: sidenav;
		}
	}
}

@layer components.fresh {
	.TopicsAside {
		display: inline-grid;
	}
}

@layer components.fresh {
	.Modal {
		display: grid;
	}
}

@view-transition {
	navigation: auto;
}

@layer base.normalize {
	html {
		view-timeline: document-timeline;
	}
}

@layer overrides {
	:root {
		background: var(--surface-document);
	}
}
`

test.beforeEach(async ({ page }) => {
	await page.goto('/css-layers-visualizer', { waitUntil: 'domcontentloaded' })
})

test('does SEO well', async ({ page }) => {
	await expect.soft(page).toHaveSeoTitle()
	await expect.soft(page).toHaveCanonical()
	await expect.soft(page).toHaveMetaDescription()
	await expect.soft(page).toHaveH1()
})

test('analyzes direct CSS input without @layers', async ({ page }) => {
	await expect(page).toBeHydrated()
	await page.getByRole('tab', { name: 'Analyze CSS input' }).click()
	await page.getByLabel('CSS to analyze').fill('a {}')
	await page.getByRole('button', { name: 'Analyze CSS' }).click()

	await expect.soft(page).toHaveURL('/css-layers-visualizer')
	await expect.soft(page.getByTestId('layer-tree')).not.toBeVisible()
	await expect.soft(page.getByTestId('no-layers-found')).toBeVisible()
})

test('analyzes direct CSS input with @layers', async ({ page }) => {
	await expect(page).toBeHydrated()
	await page.getByRole('tab', { name: 'Analyze CSS input' }).click()
	await page.getByLabel('CSS to analyze').fill('@layer test {}')
	await page.getByRole('button', { name: 'Analyze CSS' }).click()

	await expect.soft(page).toHaveURL('/css-layers-visualizer')
	await expect.soft(page.getByTestId('layer-tree')).toBeVisible()
	await expect.soft(page.getByTestId('no-layers-found')).not.toBeVisible()
})

test.describe('URL with layers', () => {
	test.beforeEach(async ({ page }) => {
		await page.route('/api/get-css*', async (route) => {
			await route.fulfill({
				json: [
					{
						type: 'link',
						media: undefined,
						href: 'https://nerdy.dev/fixture.css',
						url: 'https://nerdy.dev/fixture.css',
						rel: 'stylesheet',
						css: NERDY_DEV_FIXTURE
					}
				] satisfies CSSOrigin[]
			})
		})
		await expect(page).toBeHydrated()
		await page.getByLabel('URL to analyze').fill('example.com')
		await page.getByRole('button', { name: 'Analyze URL' }).click()
	})

	test('analyzes a URL with layers', async ({ page }) => {
		await expect.soft(page).toHaveURL('/css-layers-visualizer?url=example.com&prettify=1')
		await expect.soft(page.getByTestId('layer-tree')).toBeVisible()
		await expect.soft(page.getByTestId('no-layers-found')).not.toBeVisible()

		// Check if the layers are displayed
		let layers = page.getByTestId('layer')
		await expect(layers).toHaveCount(15)
	})

	test('Opens devtools when clicking a specific layer', async ({ page }) => {
		// Check that devtools are shown in closed state
		let layers = page.getByTestId('layer')
		let devtools = page.getByTestId('devtools')
		let inspector_tab = devtools.getByTestId('inspector')

		// Check that the devtools are hidden
		await expect.soft(inspector_tab).not.toBeVisible()
		await expect.soft(devtools.getByRole('tab').getByText('Inspector')).toHaveAttribute('data-state', 'inactive')
		await expect.soft(devtools.getByRole('tabpanel')).not.toBeVisible()

		// Click on the first layer
		await layers.first().click()

		// Check that the devtools are shown in open state
		await expect.soft(inspector_tab).toBeVisible()
		await expect.soft(devtools.getByRole('tab').getByText('Inspector')).toHaveAttribute('data-state', 'active')
		await expect.soft(devtools.getByRole('tabpanel')).toBeVisible()
	})

	test('shows the Layers devtools panel', async ({ page }) => {
		await expect(page.getByRole('tab', { name: 'Layers' })).toBeVisible()
	})
})

test('analyzes a URL without layers', async ({ page }) => {
	await page.route('/api/get-css*', async (route) => {
		await route.fulfill({
			json: [
				{
					type: 'link',
					media: undefined,
					href: 'https://example.com/fixture.css',
					url: 'https://example.com/fixture.css',
					rel: 'stylesheet',
					css: `test{}`
				}
			] satisfies CSSOrigin[]
		})
	})
	await expect(page).toBeHydrated()
	await page.getByLabel('URL to analyze').fill('example.com')
	await page.getByRole('button', { name: 'Analyze URL' }).click()

	await expect.soft(page).toHaveURL('/css-layers-visualizer?url=example.com&prettify=1')
	await expect.soft(page.getByTestId('layer-tree')).not.toBeVisible()
	await expect.soft(page.getByTestId('no-layers-found')).toBeVisible()
})
