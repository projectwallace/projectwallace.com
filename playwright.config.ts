import type { PlaywrightTestConfig } from '@playwright/test'
import { devices } from '@playwright/test'

const CI = process.env.CI !== undefined

/**
 * See https://playwright.dev/docs/test-configuration.
 */
const config: PlaywrightTestConfig = {
	testDir: './src',
	testMatch: '**/*spec.ts',
	/* Maximum time one test can run for. */
	timeout: CI ? 10 * 1000 : 5 * 1000,
	/* Maximum time the entire test suite can run for */
	globalTimeout: 10 * 60 * 1000,
	expect: {
		/**
		 * Maximum time expect() should wait for the condition to be met.
		 * For example in `await expect(locator).toHaveText();`
		 */
		timeout: 5000,
	},
	/* Run tests in files in parallel */
	fullyParallel: true,
	/* Fail the build on CI if you accidentally left test.only in the source code. */
	forbidOnly: CI,
	/* Retry on CI only */
	retries: CI ? 1 : 0,
	/* Let GitHub Actions use 4 workers; Locally let Playwright figure out how many to use. */
	workers: CI ? 4 : undefined,
	/* Reporter to use. See https://playwright.dev/docs/test-reporters */
	reporter: CI ? [['github'], ['list']] : 'list',
	/* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
	use: {
		/* Maximum time each action such as `click()` can take. Defaults to 0 (no limit). */
		actionTimeout: 0,
		/* Base URL to use in actions like `await page.goto('/')`. */
		baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL ?? 'http://localhost:5173',

		/* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
		trace: 'on-first-retry',

		// MacBook Pro dimensions
		viewport: {
			height: 1600,
			width: 2560,
		},
	},

	/* Configure projects for major browsers */
	projects: [
		{
			name: 'chromium',
			use: {
				...devices['Desktop Chrome'],
				channel: 'chromium',
				userAgent: devices['Desktop Chrome'].userAgent + ' (Playwright Test)',
			},
		},
	],

	/* Run your local dev server before starting the tests */
	webServer: {
		command: CI ? 'npm run build && npm run preview' : 'npm run dev',
		port: CI ? 4173 : 5173,
		reuseExistingServer: !CI,
		timeout: 600_000, // 10 minutes
	},
}

export default config
