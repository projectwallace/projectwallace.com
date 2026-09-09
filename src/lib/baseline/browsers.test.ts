import { describe, test, expect } from 'vitest'
import { browsers, browser_families } from './browsers'

describe('browsers', () => {
	test('every browser has a display name', () => {
		for (let id of Object.keys(browsers)) {
			expect(typeof browsers[id]).toBe('string')
			expect(browsers[id].length).toBeGreaterThan(0)
		}
	})
})

describe('browser_families', () => {
	test('every family id is a known browser', () => {
		for (let family of Object.values(browser_families)) {
			for (let id of family.ids) {
				expect(browsers[id]).toBeDefined()
			}
		}
	})

	test('every browser belongs to exactly one family', () => {
		let seen = new Set<string>()
		for (let family of Object.values(browser_families)) {
			for (let id of family.ids) {
				expect(seen.has(id)).toBe(false)
				seen.add(id)
			}
		}
		expect(seen).toEqual(new Set(Object.keys(browsers)))
	})

	test('desktop and mobile variants of the same vendor share a family', () => {
		expect(browser_families.chrome.ids).toEqual(['chrome', 'chrome_android'])
		expect(browser_families.safari.ids).toEqual(['safari', 'safari_ios'])
	})
})
