import { test, expect } from '@playwright/test'

test('RSS feed items have well-formed, unique absolute guids', async ({ request }) => {
	let response = await request.get('/blog/feed.xml')
	expect(response.ok()).toBe(true)

	let xml = await response.text()
	let guids = [...xml.matchAll(/<guid>([^<]+)<\/guid>/g)].map((match) => match[1])
	expect(guids.length).toBeGreaterThan(0)

	for (let guid of guids) {
		// Exactly one slash between the origin and the path, no double slash
		expect.soft(guid).toMatch(/^https:\/\/www\.projectwallace\.com\/blog\/[^/]+$/)
	}

	expect(new Set(guids).size).toBe(guids.length)
})
