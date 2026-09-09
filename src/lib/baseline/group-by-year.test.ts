import { describe, test, expect, vi } from 'vitest'
import type { CssFeature } from './css-feature'
import type { CssLocation } from '#lib/css-location.js'

const loc = (offset: number): CssLocation => ({ line: 1, column: offset + 1, offset, length: 1 })

const fixture_features: Record<string, CssFeature> = {
	'high-2018': { name: 'High 2018', baseline: 'high', baseline_low_date: '2016-06-01', baseline_high_date: '2018-03-01' },
	'high-2020': { name: 'High 2020', baseline: 'high', baseline_low_date: '2018-06-01', baseline_high_date: '2020-03-01' },
	'edge-artifact': {
		name: 'Edge artifact',
		baseline: 'high',
		baseline_low_date: '2015-07-29',
		baseline_high_date: '2019-01-01'
	},
	newly: { name: 'Newly', baseline: 'low', baseline_low_date: '2023-01-01' },
	limited: { name: 'Limited', baseline: false, support: ['chrome'] }
}

vi.mock('./css-features.generated.json', () => ({ default: fixture_features }))

const { group_by_year, EDGE_LAUNCH_DATE, FIRST_BASELINE_YEAR } = await import('./group-by-year')

describe('group_by_year', () => {
	test('counts a widely-available feature under its high-date year', () => {
		let by_year = group_by_year(new Map([['high-2018', [loc(0)]]]))
		expect(by_year.get('2018')).toEqual({ features: 1, count: 1, locations: [loc(0)] })
	})

	test('sums features and usages across multiple features in the same year', () => {
		let by_year = group_by_year(
			new Map([
				['high-2018', [loc(0)]],
				['high-2020', [loc(1), loc(2)]]
			])
		)
		expect(by_year.get('2018')).toEqual({ features: 1, count: 1, locations: [loc(0)] })
		expect(by_year.get('2020')).toEqual({ features: 1, count: 2, locations: [loc(1), loc(2)] })
	})

	test('excludes features whose low date is the Edge-launch artifact', () => {
		let by_year = group_by_year(new Map([['edge-artifact', [loc(0)]]]))
		expect(by_year.get('2019')).toEqual({ features: 0, count: 0, locations: [] })
	})

	test('excludes features that are not widely available', () => {
		let by_year = group_by_year(
			new Map([
				['newly', [loc(0)]],
				['limited', [loc(1)]]
			])
		)
		for (let counts of by_year.values()) {
			expect(counts.features).toBe(0)
		}
	})

	test('unknown feature ids are ignored', () => {
		let by_year = group_by_year(new Map([['does-not-exist', [loc(0)]]]))
		for (let counts of by_year.values()) {
			expect(counts.features).toBe(0)
		}
	})

	test('every year from FIRST_BASELINE_YEAR through the current year is present, even with zero counts', () => {
		let by_year = group_by_year(new Map())
		let last_year = new Date().getFullYear()
		let years = Array.from(by_year.keys())
		expect(years).toEqual(
			Array.from({ length: last_year - FIRST_BASELINE_YEAR + 1 }, (_, i) => String(FIRST_BASELINE_YEAR + i))
		)
		for (let counts of by_year.values()) {
			expect(counts).toEqual({ features: 0, count: 0, locations: [] })
		}
	})

	test('EDGE_LAUNCH_DATE matches the fixture artifact date', () => {
		expect(EDGE_LAUNCH_DATE).toBe('2015-07-29')
	})
})
