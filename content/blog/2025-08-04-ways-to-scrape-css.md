---
title: 3 ways to scrape CSS from a website
excerpt: Over the years I have explored several ways to get hold of a website's CSS. So far I've found these three options, each with their pros and cons.
---

Over the years I have explored several ways to get hold of a website's CSS. So far I've found these three options, each with their pros and cons. None of these methods actually check if the CSS is actually used, they only collect as much CSS as they possibly can.

## Table of contents

1. [Option 1: Scrape the HTML](#option-1-scrape-the-html)
2. [Option 2: Use CSSOM](#option-2-use-cssom)
3. [Option 3: Use CSSCoverage API](#option-3-use-csscoverage-api)
4. [Summary](#summary)

## Option 1: Scrape the HTML

Project Wallace scrapes websites by fetching the HTML and then going through all HTML elements to grab bits of CSS out of them. This is a fast and cheap way to scrape websites because it does not involve a headless browser but only a handful of dependencies and some clever thinking. More specifically it looks like this:

1. Fetch the HTML document belonging to the URL you've entered (this works best in a NodeJS enviroment but in some cases is also possible in the browser)
2. Parse the HTML into an AST
	1. Tip: use [`DOMParser.parseFromString()`](https://developer.mozilla.org/en-US/docs/Web/API/DOMParser/parseFromString) if you're in a browser environment or [linkedom](https://github.com/WebReflection/linkedom) if you're in a JavaScript engine like NodeJS
3. Walk the AST and grab every `<style>` element
	1. Each `<style>`'s contents can be added to our CSS as-is
4. Walk the tree and grab every `<link rel~="stylesheet">`
	1. Grab the `href` from the `<link>`
	2. Fetch the `href`'s contents
	2. Add the contents to our CSS
5. Walk the tree and grab every `[style]` element
	1. The `style` contents of `<div style="color: red; margin: 0">` can be taken as-is
	2. Make up a selector and rule for the single element (like `div` in this example), or one selector and rule for _all_ elements with inline styles (`inline-styles { color: red, etc. }`)
	3. Add the inline CSS to the rule
	4. Add the rule(s) to our CSS
6. Recursively scrape any CSS `@import`
	1. Parse the CSS into an AST
	2. Walk the tree and take each `import` atrule
	3. Take the `url()` of the import
	4. Download the contents of the URL
	5. Add to our CSS

### Pros and cons

| ✅ Pros | ❌ Cons |
|---------|---------|
| Cheap to run on a server | A lot of work to manage state, timeouts, error handling and data flows |
| Returns the CSS as it was sent to the browser / as authored | Does not easily fit in a bookmarklet |
| Can be run in your browser or other JavaScript runtimes | Does not find adoptedStylesheets or CSS injected with runtime CSS-in-JS |

## Option 2: Use CSSOM

The CSSOM is a collection of APIs that can be used to manipulate CSS from JavaScript. Part of this is the [`document.styleSheets`](https://developer.mozilla.org/en-US/docs/Web/API/Document/styleSheets) property that we can use to grab all the CSS from a webpage. It's such a small task that I'll put the entire script here:

### CSSOM Example

```js
function scrape_css()
	let css = ''

	for (let stylesheet of document.styleSheets) { // [1]
		for (let rule of stylesheet.cssRules) { // [2]
			css =+ rule.cssText // [3]
		}
	}

	return css
}
```

### Explanation

1. Go over all the stylesheets of [`document.styleSheets`](https://developer.mozilla.org/en-US/docs/Web/API/Document/styleSheets)
2. Take the [`cssRules`](https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleSheet/cssRules) of each `styleSheet`
3. Read the [`cssText`](https://developer.mozilla.org/en-US/docs/Web/API/CSSRule/cssText) property from each `CSSRule` and add it to our `css` string. This sometimes causes Cross Origin issues so you may want to wrap that in a try-catch block.

### Pros and cons

| ✅ Pros | ❌ Cons |
|---------|---------|
| Much simpler than HTML scraping | Requires a browser ('real' or headless), making it more expensive than HTML scraping to run on a server |
| Fits in a bookmarklet easily | Does not return the CSS in the format that it was authored in (it changes color notations, etc.) |
| Can be run in your browser or any JavaScript runtime that supports running (headless) browsers | Does not scrape inline styles |
|  | Cross Origin errors sometimes happen and are hard to solve |

## Option 3: Use CSSCoverage API

Headless browsers and Chromium-based browsers have the `CSSCoverage` API which can be used to detect which parts of your CSS are actually used and which parts aren't. A [great API](https://playwright.dev/docs/api/class-coverage#coverage-start-css-coverage) in itself but we can also use it to find _all_ the CSS.

### CSSCoverage Example

```js
import { chromium } from 'playwright' // or 'puppeteer'

async function scrape() {
	let browser = await chromium.launch() // [1a]
	let page = await browser.newPage() // [1b]

	await page.coverage.startCSSCoverage() // [2]
	await page.goto('https://example.com') // [3]
	let coverage = await page.coverage.stopCSSCoverage() // [4]

	let css = ''
	for (let entry of coverage) {
		css += entry.text
	}

	return css
}
```

### Explanation

1. Create a new browser and page
2. Tell the browser to prepare to collect some coverage information. This must be done before going to a URL if you want to know all the CSS on the page after it loads
3. Go to the actual URL you want to scrape
4. Collect the coverage that the browser has covered
5. Go over the coverage report and extract the CSS

### Pros and cons

| ✅ Pros | ❌ Cons |
|---------|---------|
| Much simpler than HTML scraping | Requires a browser ('real' or headless), making it more expensive than HTML scraping to run on a server |
| Can be run in any JavaScript runtime that supports running (headless) browsers | Does not run in a bookmarklet |
| CSSCoverage can also be collected between opening a page, doing interactions and navigating to other pages | |

## Summary

Each of these methods has their pros and cons so it really depends on the use case what you'll end up using.

|                       | HTML Scraper          | CSSOM | CSSCoverage API |
|-----------------------|-----------------------|-------|-----------------|
| Leaves CSS intact     | ✅                     | ❌     | ✅               |
| Cost to run on server | 💰                     | 💰💰    | 💰💰              |
| Complexity            | 100                   | 10    | 30              |
| Runs in bookmarklet   | ✅ (a big bookmarklet) | ✅     | ❌               |
| Scrape inline styles  | ✅                     | ❌     | ❌               |

Hope this was helpful. Did I miss anything? Let me know!
