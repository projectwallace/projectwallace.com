import { test, expect, vi, afterEach } from 'vitest'
import { debounce } from './debounce.ts'

afterEach(() => {
	vi.useRealTimers()
})

test('calls the function once after the delay', () => {
	vi.useFakeTimers()
	const fn = vi.fn<(arg?: string) => void>()
	const debounced = debounce(fn, 100)

	debounced()
	vi.advanceTimersByTime(99)
	expect(fn).not.toHaveBeenCalled()
	vi.advanceTimersByTime(1)
	expect(fn).toHaveBeenCalledTimes(1)
})

test('resets the timer on repeated calls and uses the last arguments', () => {
	vi.useFakeTimers()
	const fn = vi.fn<(arg?: string) => void>()
	const debounced = debounce(fn, 100)

	debounced('a')
	vi.advanceTimersByTime(50)
	debounced('b')
	vi.advanceTimersByTime(99)
	expect(fn).not.toHaveBeenCalled()
	vi.advanceTimersByTime(1)
	expect(fn).toHaveBeenCalledTimes(1)
	expect(fn).toHaveBeenCalledWith('b')
})

test('can fire again after the delay passed', () => {
	vi.useFakeTimers()
	const fn = vi.fn<(arg?: string) => void>()
	const debounced = debounce(fn, 10)

	debounced()
	vi.advanceTimersByTime(10)
	debounced()
	vi.advanceTimersByTime(10)
	expect(fn).toHaveBeenCalledTimes(2)
})
