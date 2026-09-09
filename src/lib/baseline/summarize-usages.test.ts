import { describe, test, expect, vi } from 'vitest'
import type { CssFeature } from './css-feature'
import type { CssLocation } from '#lib/css-location.js'

const loc = (offset: number): CssLocation => ({ line: 1, column: offset + 1, offset, length: 1 })

const fixture_features: Record<string, CssFeature> = {
	widely: { name: 'Widely', baseline: 'high', baseline_low_date: '2016-06-01', baseline_high_date: '2018-03-01' },
	newly: { name: 'Newly', baseline: 'low', baseline_low_date: '2023-01-01' },
	limited: { name: 'Limited', baseline: false, support: ['chrome'] },
	'edge-artifact': {
		name: 'Edge artifact',
		baseline: 'high',
		baseline_low_date: '2015-07-29',
		baseline_high_date: '2019-01-01'
	}
}

vi.mock('./css-features.generated.json', () => ({ default: fixture_features }))

const { summarize_usages } = await import('./summarize-usages')

describe('summarize_usages', () => {
	test('buckets a widely-available feature', () => {
		let summary = summarize_usages(new Map([['widely', [loc(0)]]]))
		expect(summary.widely_available).toEqual({ features: 1, usages: 1, locations: [loc(0)] })
		expect(summary.newly_available.features).toBe(0)
		expect(summary.limited_availability.features).toBe(0)
	})

	test('buckets a newly-available feature', () => {
		let summary = summarize_usages(new Map([['newly', [loc(0)]]]))
		expect(summary.newly_available).toEqual({ features: 1, usages: 1, locations: [loc(0)] })
	})

	test('buckets a limited-availability feature', () => {
		let summary = summarize_usages(new Map([['limited', [loc(0)]]]))
		expect(summary.limited_availability).toEqual({ features: 1, usages: 1, locations: [loc(0)] })
	})

	test('sums usages across multiple locations of the same feature', () => {
		let summary = summarize_usages(new Map([['widely', [loc(0), loc(1), loc(2)]]]))
		expect(summary.widely_available).toEqual({ features: 1, usages: 3, locations: [loc(0), loc(1), loc(2)] })
	})

	test('excludes features whose low date is the Edge-launch artifact', () => {
		let summary = summarize_usages(new Map([['edge-artifact', [loc(0)]]]))
		expect(summary.widely_available).toEqual({ features: 0, usages: 0, locations: [] })
	})

	test('unknown feature ids are ignored', () => {
		let summary = summarize_usages(new Map([['does-not-exist', [loc(0)]]]))
		expect(summary).toEqual({
			widely_available: { features: 0, usages: 0, locations: [] },
			newly_available: { features: 0, usages: 0, locations: [] },
			limited_availability: { features: 0, usages: 0, locations: [] }
		})
	})

	test('empty usages produce an all-zero summary', () => {
		let summary = summarize_usages(new Map())
		expect(summary).toEqual({
			widely_available: { features: 0, usages: 0, locations: [] },
			newly_available: { features: 0, usages: 0, locations: [] },
			limited_availability: { features: 0, usages: 0, locations: [] }
		})
	})
})
