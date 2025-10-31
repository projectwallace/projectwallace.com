---
title: How to calculate CSS code coverage with @playwright/test
---

<script>
	import cli from '$lib/img/blog/2025-10-31-how-to-calculate-css-code-coverage-with-playwright/css-code-coverage-linter-cli.png?enhanced'
  import cli_full from '$lib/img/blog/2025-10-31-how-to-calculate-css-code-coverage-with-playwright/css-code-coverage-linter-cli.png'
</script>

One of the most common questions around analyzing CSS quality is how to detect unused CSS. Shipping unused CSS to the browser is a waste so we want to avoid it! This post shows how to collect CSS code coverage data with the help of [`@playwright/test`](https://playwright.dev/docs/intro).

## Table of contents

1. [Writing Playwright tests](#writing-playwright-tests)
2. [Collect CSS Coverage from Playwright tests](#collect-css-coverage-from-playwright-tests)
3. [Analyzing and linting CSS Coverage](#analyzing-and-linting-css-coverage)

## Writing Playwright tests

Start with writing Playwright tests for our website. Playwright tests run in a headless browser and they emulate user behaviour to verify that your website works as intended. The Project Wallace website has 230 tests. Here is one of them:

```ts
import { test, expect } from './tests/fixtures'

test('Navigation: pressing Escape on the popover closes the popover', async ({ page }) => {
	let trigger = page.getByRole('navigation').getByLabel('Additional navigation items')
	let popover = page.locator('.nav-popover')

	await page.setViewportSize({ width: 420, height: 800 })
	await trigger.click()

	// Press Escape
	await page.keyboard.press('Escape')

	// Check that the popover is not visible
	await expect.soft(popover).not.toBeVisible()
	await expect.soft(trigger).not.toHaveAttribute('aria-expanded', 'true')
})
```

That's just one test, but imagine you have your whole website covered by these sort of tests. Extensive test coverage is essential for calculating CSS coverage.

Notice the import of a fixture instead of the default `import { test, expect } from playwright/test'`. In the next step we'll look at how to collect the data using these tests and why we use this fixture.

## Collect CSS Coverage from Playwright tests

Now that we have tests, we can start collecting data! Playwright provides two functions related to CSS Coverage: [`coverage.startCSSCoverage()`](https://playwright.dev/docs/api/class-coverage#coverage-start-css-coverage) and [`coverage.stopCSSCoverage()`](https://playwright.dev/docs/api/class-coverage#coverage-stop-css-coverage). If you combine these functions with Playwright [fixtures](https://playwright.dev/docs/test-fixtures#creating-a-fixture) you can collect coverage data from within your Playwright tests:

```ts
type Fixtures = {
	cssCoverage: void
}

export const test = base_test.extend<Fixtures>({
	cssCoverage: [
		async ({ page }, use, testInfo) => {
			// start before test
			await page.coverage.startCSSCoverage()
			await use()
			// stop after test
			let coverage = await page.coverage.stopCSSCoverage()

			// write coverage to disk
			await fs.writeFile('path-to-file.json', JSON.stringify(coverage))
		},
		{ auto: true }
	]
})
```

You can peek at [our implementation on GitHub](https://github.com/projectwallace/projectwallace.com/blob/68080570ce614335bd6c10d5980f767c2628de86/tests/fixtures.ts#L6-L41).

Let's break it down:

### Creating the fixture

This creates the actual [fixture](https://playwright.dev/docs/test-fixtures#creating-a-fixture) _and_ it tells Playwright to [automatically](https://playwright.dev/docs/test-fixtures#automatic-fixtures) set up this fixture for every test.

```ts
type Fixtures = {
	cssCoverage: void
}

export const test = base_test.extend<Fixtures>({
	cssCoverage: [
		async ({ page }, use, testInfo) => {
			// etc.
		},
		{ auto: true },
	]
```

### Collecting coverage

The core of the fixture is surprisingly small! Start collecting, run the test and stop collecting.

```ts
// start before test
await page.coverage.startCSSCoverage()
await use()
// stop after test
let coverage = await page.coverage.stopCSSCoverage()
```

### Write coverage to disk

To be able to use the coverage data later on we need to write it to disk. In practice you'll give this JSON file a unique name, probably the name or path of your actual test.

```ts
await fs.writeFile('./css-coverage/path-to-file.json', JSON.stringify(coverage))
```

That's all! Because of the auto-fixture every test will now self-report all CSS Coverage data.

## Analyzing and linting CSS Coverage

After running our 230 Playwright tests we have megabytes of coverage data that we can start analyzing. As you could read in my [previous blog post](https://www.projectwallace.com/blog/better-coverage-ranges) there are a lot of gaps to fill. On top of that many tests report the same coverage ranges for the same files so there is also a lot deduplication to do. And prettifying the CSS because no-one likes inspecting minified CSS. This is where our new [@projectwallace/css-code-coverage](https://github.com/projectwallace/css-code-coverage) package comes in handy. It does all that for us and generates handy statitstics. It even ships with a CLI that works as a CSS Coverage linter!

The previous step generated a folder full with 230 JSON files in `/css-coverage`. We're going to use @projectwallace/css-code-coverage to make sure that our coverage is at an acceptable number:

```sh
css-coverage --coverage-dir=./css-coverage --min-line-coverage=.9  --min-file-line-coverage=.62 --show-uncovered=all
```

See [our implementation here](https://github.com/projectwallace/projectwallace.com/blob/68080570ce614335bd6c10d5980f767c2628de86/package.json#L18) as a `package.json` script.

This command:

- Tells the linter that our coverage JSON files live at `./css-coverage`
- Sets the threshold for line coverage to .9 (or 90%) meaning that at least 90% of _all_ lines of CSS combined must be covered
- Sets the threshold of file line coverage to .7 (or 70%) meaning that each individual CSS file must at least have 70% line coverage
- Instructs the linter to report all CSS files that don't have 100% coverage

This is the result when running it for projectwallace.com's repository:

<figure>
	<a href={cli_full}>
		<enhanced:img src={cli} alt="A terminal showing 'Failed: line coverage is 82.50%% which is lower than the threshold of 0.9; Failed: 4 files do not meet the minimum line coverage of 70.00% (minimum coverage was 47.75%)' and part of a CSS file where some lines are marked as uncovered." loading="lazy" />
	</a>
	<figcaption>The CLI tool highlights which lines are not covered and even gives a hint with how many lines to go to meet the threshold.</figcaption>
</figure>

The @projectwallace/css-code-coverage package focuses on lines and not on bytes because as developers we also look at lines of code.

Running this CLI in a GitHub action after the Playwright test gives you have accurate test data in each run and and a safeguard against shipping unused CSS!
