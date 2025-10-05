import { test, expect } from 'vitest'
import { deduplicate_entries } from './calculate-coverage'

test('handles a single entry', () => {
	let entry = {
		text: 'a {}',
		ranges: [{ start: 0, end: 4 }],
		url: 'example.com'
	}
	expect(deduplicate_entries([entry])).toEqual(new Map([[entry.text, { url: entry.url, ranges: entry.ranges }]]))
})

test('deduplicats a simple duplicate entry', () => {
	let entry = {
		text: 'a {}',
		ranges: [{ start: 0, end: 4 }],
		url: 'example.com'
	}
	expect(deduplicate_entries([entry, entry])).toEqual(new Map([[entry.text, { url: entry.url, ranges: entry.ranges }]]))
})

test('merges two identical texts with different URLs and identical ranges', () => {
	let entries = [
		{
			text: 'a {}',
			ranges: [{ start: 0, end: 4 }],
			url: 'example.com/a'
		},
		{
			text: 'a {}',
			ranges: [{ start: 0, end: 4 }],
			url: 'example.com/b'
		}
	]
	expect(deduplicate_entries(entries)).toEqual(
		new Map([[entries[0].text, { url: entries[0].url, ranges: entries[0].ranges }]])
	)
})

test('merges different ranges on identical CSS, different URLs', () => {
	let entries = [
		{
			text: 'a {} b {}',
			ranges: [{ start: 0, end: 4 }],
			url: 'example.com/a'
		},
		{
			text: 'a {} b {}',
			ranges: [{ start: 5, end: 9 }],
			url: 'example.com/b'
		}
	]
	expect(deduplicate_entries(entries)).toEqual(
		new Map([[entries[0].text, { url: entries[0].url, ranges: [entries[0].ranges[0], entries[1].ranges[0]] }]])
	)
})

test('merges different ranges on identical CSS, identical URLs', () => {
	let entries = [
		{
			text: 'a {} b {}',
			ranges: [{ start: 0, end: 4 }],
			url: 'example.com'
		},
		{
			text: 'a {} b {}',
			ranges: [{ start: 5, end: 9 }],
			url: 'example.com'
		}
	]
	expect(deduplicate_entries(entries)).toEqual(
		new Map([[entries[0].text, { url: entries[0].url, ranges: [entries[0].ranges[0], entries[1].ranges[0]] }]])
	)
})

test('does not merge different CSS with different URLs and identical ranges', () => {
	let entries = [
		{
			text: 'a {}',
			ranges: [{ start: 0, end: 4 }],
			url: 'example.com/a'
		},
		{
			text: 'b {}',
			ranges: [{ start: 0, end: 4 }],
			url: 'example.com/b'
		}
	]
	expect(deduplicate_entries(entries)).toEqual(
		new Map([
			[entries[0].text, { url: entries[0].url, ranges: entries[0].ranges }],
			[entries[1].text, { url: entries[1].url, ranges: entries[1].ranges }]
		])
	)
})

test('does not merge different CSS with same URLs and identical ranges', () => {
	let entries = [
		{
			text: 'a {}',
			ranges: [{ start: 0, end: 4 }],
			url: 'example.com'
		},
		{
			text: 'b {}',
			ranges: [{ start: 0, end: 4 }],
			url: 'example.com'
		}
	]
	expect(deduplicate_entries(entries)).toEqual(
		new Map([
			[entries[0].text, { url: entries[0].url, ranges: entries[0].ranges }],
			[entries[1].text, { url: entries[1].url, ranges: entries[1].ranges }]
		])
	)
})
