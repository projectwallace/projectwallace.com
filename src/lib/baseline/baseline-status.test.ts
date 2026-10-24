import { describe, test, expect } from 'vitest'
import { get_baseline_availability, is_browser_supported } from './baseline-status'
import type { CssFeature } from './css-feature'

function feature(overrides: Partial<CssFeature> = {}): CssFeature {
	return { name: 'test-feature', baseline: false, ...overrides }
}

describe('get_baseline_availability', () => {
	test('widely available when baseline is high', () => {
		expect(get_baseline_availability(feature({ baseline: 'high' }))).toBe('widely')
	})

	test('newly available when baseline is low', () => {
		expect(get_baseline_availability(feature({ baseline: 'low' }))).toBe('newly')
	})

	test('limited availability when baseline is false', () => {
		expect(get_baseline_availability(feature({ baseline: false }))).toBe('limited')
	})
})

describe('is_browser_supported', () => {
	test('widely and newly available features are always supported', () => {
		expect(is_browser_supported(feature({ baseline: 'high' }), 'widely', [])).toBe(true)
		expect(is_browser_supported(feature({ baseline: 'low' }), 'newly', [])).toBe(true)
	})

	test('limited availability supported when every browser id matches', () => {
		let f = feature({ baseline: false, support: ['chrome', 'chrome_android'] })
		expect(is_browser_supported(f, 'limited', ['chrome', 'chrome_android'])).toBe(true)
	})

	test('limited availability unsupported when only some browser ids in the family match', () => {
		let f = feature({ baseline: false, support: ['safari'] })
		expect(is_browser_supported(f, 'limited', ['safari', 'safari_ios'])).toBe(false)
	})

	test('limited availability unsupported when no browser id matches', () => {
		let f = feature({ baseline: false, support: ['firefox', 'firefox_android'] })
		expect(is_browser_supported(f, 'limited', ['chrome', 'chrome_android'])).toBe(false)
	})

	test('limited availability with no support list is unsupported', () => {
		let f = feature({ baseline: false })
		expect(is_browser_supported(f, 'limited', ['chrome', 'chrome_android'])).toBe(false)
	})
})
