/**
 * The browsers Baseline tracks support across, keyed by web-features browser
 * id. Small and stable enough to hand-write rather than generate.
 */
export const browsers: Record<string, string> = {
	chrome: 'Chrome',
	chrome_android: 'Chrome Android',
	edge: 'Edge',
	firefox: 'Firefox',
	firefox_android: 'Firefox Android',
	safari: 'Safari',
	safari_ios: 'Safari iOS'
}

export type BrowserDevice = 'desktop' | 'mobile'

export const browsers_by_device: Record<BrowserDevice, string[]> = {
	desktop: ['chrome', 'edge', 'firefox', 'safari'],
	mobile: ['chrome_android', 'firefox_android', 'safari_ios']
}
