import { goto } from '$app/navigation'
import { browser } from '$app/environment'

/**
 * Utilities for storing state in the URL hash using base64 encoding.
 *
 * Using hash instead of query params because:
 * - Hash changes don't trigger server requests or page reloads
 * - Avoids server URL length limits (hashes aren't sent to servers)
 * - Common pattern in playgrounds (TypeScript, postcss-preset-env, etc.)
 */

/**
 * Decode a base64-encoded JSON value from the URL hash.
 * Returns undefined if hash is empty or invalid.
 */
export function decodeHashState<T>(hash: string): T | undefined {
	const value = hash.startsWith('#') ? hash.slice(1) : hash
	if (!value) return

	try {
		// TODO: use Uint8Array.fromBase64() when browsers support it
		return JSON.parse(decodeURIComponent(atob(value))) as T
	} catch {
		// fail silently
	}
}

/**
 * Encode a value to base64 JSON for use in the URL hash.
 */
export function encodeHashState<T>(value: T): string {
	// TODO: use Uint8Array.toBase64() when browsers support it
	return btoa(encodeURIComponent(JSON.stringify(value)))
}

/**
 * Reactive state synced with the URL hash.
 * Reads initial value from hash on mount, writes back with debounce on change.
 *
 * @example
 * const css = new HashState(defaultCss)
 * // use css.current for reading/writing
 *
 * @example
 * const state = new HashState<{ before: string; after: string }>({ before: '', after: '' })
 * // use state.current.before, state.current.after
 */
export class HashState<T> {
	#value = $state<T>() as T
	#debounceMs: number

	constructor(defaultValue: T, debounceMs = 300) {
		this.#debounceMs = debounceMs

		// Read hash synchronously to avoid flash of default content
		if (browser) {
			const decoded = decodeHashState<T>(window.location.hash)
			this.#value = decoded ?? defaultValue
		} else {
			this.#value = defaultValue
		}

		$effect(() => {
			if (!browser) return

			// JSON.stringify forces deep tracking of all nested properties
			const serialized = JSON.stringify(this.#value)
			const timeout = setTimeout(() => {
				goto(`#${btoa(encodeURIComponent(serialized))}`, { replaceState: true, noScroll: true, keepFocus: true })
			}, this.#debounceMs)
			return () => clearTimeout(timeout)
		})
	}

	get current() {
		return this.#value
	}

	set current(value: T) {
		this.#value = value
	}
}
