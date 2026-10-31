import { test, expect, vi, afterEach, type MockInstance } from 'vitest'
import { save_theme } from './theme.ts'

afterEach(() => {
	vi.useRealTimers()
	vi.unstubAllGlobals()
})

test('saves the theme once, after the debounce delay', async () => {
	vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
	const fetch_mock = vi.fn<typeof fetch>().mockResolvedValue(new Response())
	vi.stubGlobal('fetch', fetch_mock)

	save_theme('dark')
	save_theme('light')
	expect(fetch_mock).not.toHaveBeenCalled()

	await vi.advanceTimersByTimeAsync(300)
	expect(fetch_mock).toHaveBeenCalledTimes(1)
	expect(fetch_mock).toHaveBeenCalledWith('/api/theme', expect.objectContaining({ method: 'POST', body: 'light' }))
})

test('handles a failing save instead of leaving an unhandled rejection', async () => {
	vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })

	// Create the rejected promise only when fetch is called, so that a handler can be
	// attached in the same tick. Creating it up front would itself be an unhandled rejection.
	let catch_spy: MockInstance<Promise<never>['catch']> | undefined
	vi.stubGlobal(
		'fetch',
		vi.fn(() => {
			const failed_request = Promise.reject(new Error('offline'))
			catch_spy = vi.spyOn(failed_request, 'catch')
			return failed_request
		})
	)

	save_theme('dark')
	await vi.advanceTimersByTimeAsync(300)

	expect(catch_spy).toHaveBeenCalledTimes(1)
})
