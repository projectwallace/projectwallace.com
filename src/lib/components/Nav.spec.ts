import { type Locator } from '@playwright/test'
import { test, expect } from '../../../tests/fixtures'
import { items } from './Nav.items'

const active_page_index = 2
const small_screen_dimensions = { width: 420, height: 800 }
const large_screen_dimensions = { width: 1440, height: 800 }
const nav_items_visible_on_small_screen = 2

test.describe('Main Nav', () => {
	let trigger: Locator
	let popover: Locator

	test.beforeEach(async ({ page }) => {
		await page.setViewportSize(large_screen_dimensions)
		await page.goto(items.at(active_page_index)!.url, { waitUntil: 'domcontentloaded' })
		await expect(page).toBeHydrated()
		trigger = page.getByRole('navigation').getByLabel('Additional navigation items')
		popover = page.locator('.nav-popover')
	})

	test('shows the current page highlighted', async ({ page }) => {
		let links = page.getByRole('navigation').getByRole('list').getByRole('link')
		await expect(links.nth(active_page_index)).toHaveAttribute('aria-current', 'page')
	})

	test('shows all nav items when page is large enough', async ({ page }) => {
		await page.setViewportSize(large_screen_dimensions)

		// Check that all nav items are visible
		let links = page.getByRole('navigation').getByRole('list').getByRole('link')
		await expect.soft(links).toHaveCount(items.length)

		for (let link of await links.all()) {
			await expect.soft(link).toBeVisible()
		}

		await expect.soft(trigger).not.toBeVisible()
		await expect.soft(popover).not.toBeVisible()
	})

	test('shows only part of nav items when page is small', async ({ page }) => {
		await page.setViewportSize(small_screen_dimensions)

		// Check that not all nav items are visible
		let links = page.getByRole('navigation').getByRole('list').getByRole('link')
		await expect.soft(links).toHaveCount(nav_items_visible_on_small_screen)

		// Check that the popover trigger is visible
		await expect.soft(trigger).toBeVisible()
		await expect.soft(trigger).not.toHaveAttribute('aria-expanded', 'true')

		// Check that the popover is not visible
		await expect.soft(popover).not.toBeVisible()
	})

	test('tabbing through the nav items focuses the popover trigger', async ({ page }) => {
		await page.setViewportSize(small_screen_dimensions)

		// wait for the nav to have resized and the popover trigger to be visible
		await expect.soft(trigger).toBeVisible()

		// Focus the first nav item
		let links = page.getByRole('navigation').getByRole('list').getByRole('link')
		await links.nth(nav_items_visible_on_small_screen - 1).focus()
		await page.keyboard.press('Tab')

		// Check that the popover trigger is focused
		await expect.soft(trigger).toBeFocused()
	})

	test('shows all nav items when clicking the popover trigger', async ({ page }) => {
		await page.setViewportSize(small_screen_dimensions)
		await trigger.click()

		// Check that the popover is visible
		await expect.soft(popover).toBeVisible()
		await expect.soft(trigger).toHaveAttribute('aria-expanded', 'true')

		// Check that popover contains all remaining nav items
		let links = popover.getByRole('link')
		await expect.soft(links).toHaveCount(items.length - nav_items_visible_on_small_screen)
	})

	test('clicking a nav item closes the popover', async ({ page }) => {
		await page.setViewportSize(small_screen_dimensions)
		await trigger.click()

		// Click a nav item
		let link = popover.getByRole('link').nth(1)
		await link.click()

		// Check that the popover is not visible
		await expect.soft(popover).not.toBeVisible()
		await expect.soft(trigger).not.toHaveAttribute('aria-expanded', 'true')

		// Check that the page navigated to the correct URL
		await expect.soft(page).toHaveURL(items[nav_items_visible_on_small_screen + 1].url)
	})

	test('resizing the page to a large width closes the popover', async ({ page }) => {
		await page.setViewportSize(small_screen_dimensions)
		await trigger.click()

		// Resize the page to a large width
		await page.setViewportSize(large_screen_dimensions)

		// Check that all nav items are visible
		let links = page.getByRole('navigation').getByRole('list').getByRole('link')
		await expect.soft(links).toHaveCount(items.length)

		for (let link of await links.all()) {
			await expect.soft(link).toBeVisible()
		}

		await expect.soft(trigger).not.toBeVisible()
		await expect.soft(popover).not.toBeVisible()
	})

	test('typing Enter on the popover trigger opens the popover', async ({ page }) => {
		await page.setViewportSize(small_screen_dimensions)

		// Focus the popover trigger
		await trigger.focus()

		// Press Enter
		await trigger.press('Enter')

		// Check that the popover is visible
		await expect.soft(popover).toBeVisible()
		await expect.soft(trigger).toHaveAttribute('aria-expanded', 'true')
	})

	test('clicking outside the popover closes it', async ({ page }) => {
		await page.setViewportSize(small_screen_dimensions)
		await trigger.click()

		// Click outside the popover
		await page.mouse.click(10, 10)

		// Check that the popover is not visible
		await expect.soft(popover).not.toBeVisible()
		await expect.soft(trigger).not.toHaveAttribute('aria-expanded', 'true')
	})

	test('typing Escape on the popover closes the popover', async ({ page }) => {
		await page.setViewportSize(small_screen_dimensions)
		await trigger.click()

		// Press Escape
		await page.keyboard.press('Escape')

		// Check that the popover is not visible
		await expect.soft(popover).not.toBeVisible()
		await expect.soft(trigger).not.toHaveAttribute('aria-expanded', 'true')
	})
})
