import { test, expect, vi, afterEach } from 'vitest'
import { save_theme } from './theme.ts'

afterEach(() => {
	vi.useRealTimers()
	vi.unstubAllGlobals()
})

test('saves the theme once, after the debounce delay', async () => {
	vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
	const fetch_mock = vi.fn().mockResolvedValue(new Response())
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
	const failed_request = Promise.reject(new Error('offline'))
	const catch_spy = vi.spyOn(failed_request, 'catch')
	vi.stubGlobal('fetch', vi.fn().mockReturnValue(failed_request))

	save_theme('dark')
	await vi.advanceTimersByTimeAsync(300)

	expect(catch_spy).toHaveBeenCalledTimes(1)
})
