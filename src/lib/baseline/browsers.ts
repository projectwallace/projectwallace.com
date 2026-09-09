export const browsers = {
	chrome: 'Chrome',
	chrome_android: 'Chrome Android',
	edge: 'Edge',
	firefox: 'Firefox',
	firefox_android: 'Firefox Android',
	safari: 'Safari',
	safari_ios: 'Safari iOS'
} as const satisfies Record<string, string>

export type BrowserId = keyof typeof browsers

export type BrowserFamily = 'chrome' | 'edge' | 'firefox' | 'safari'

/**
 * One entry per browser logo. Desktop and mobile variants of the same
 * vendor (Chrome/Chrome Android, etc.) share a single icon and support
 * indicator, matching the original Baseline status web component.
 */
export const browser_families: Record<BrowserFamily, { name: string; ids: BrowserId[] }> = {
	chrome: { name: 'Chrome', ids: ['chrome', 'chrome_android'] },
	edge: { name: 'Edge', ids: ['edge'] },
	firefox: { name: 'Firefox', ids: ['firefox', 'firefox_android'] },
	safari: { name: 'Safari', ids: ['safari', 'safari_ios'] }
}
