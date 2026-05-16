---
title: How Project Wallace extracts all CSS from any webpage
excerpt: Extracting all CSS from a webpage involves more work than you might expect. Here's how Project Wallace does it.
author: bartveneman
keywords: css, extract, get-css, scrape
---

**TLDR; Getting all CSS from a webpage requires a couple of different methods and some filtering. Go straight to <a href="#the-algorithm">the summary</a> or [the GitHub repository](https://github.com/bartveneman/extract-css-core).**

Project Wallace would be nowhere without the prior art of CSS Stats. They came up with [get-css](https://github.com/cssstats/cssstats/tree/master/packages/get-css) and this got me started in figuring out how to scrape CSS myself. Their algorithm is as simple as it is genius.

- Take all `<link>` tags from the page, go to it's `href` and take the CSS
- Follow any `@import` rule and take it's CSS
- Take all `<style>` tags from the page and take it's CSS
- Follow any `@import` rule and take it's CSS
- Combine all these chunks of CSS into a single piece.

### When this approach doesn't work

At the moment, they haven't included a way to scrape inline styles. I don't know whether that's intentional or not. For pages that utilize CSS-in-JS, the above method will not work. For that we need a browser that is able to evaluate styles at runtime, and looking at `<link>`s and `<style>`s is not enough. And with the rise of usage of CSS-in-JS, it's time for an improved version.

## The in-depth way

The _complicated_ way of getting all CSS involves a (optionally headless) browser and three key ingredients:

- The [CSS Coverage](https://developers.google.com/web/tools/chrome-devtools/coverage/) [API](https://github.com/puppeteer/puppeteer/blob/master/docs/api.md#class-coverage) (available in Puppeteer, so available for Firefox and Chromium-based browsers).
- The [HTML StyleSheets API](https://developer.mozilla.org/en-US/docs/Web/API/DocumentOrShadowRoot/styleSheets)
- A plain old [`document.querySelectorAll()`](https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelectorAll)

### The algorithm

For the complete algorithm, check out [the source code GitHub](https://github.com/bartveneman/extract-css-core/blob/d365e7f699fe12c71640af8f6dfa572f86d2e14b/src/index.js). The short and readable version is something like this:

- Start the CSS Coverage reporter
- Go to the webpage
- Stop the CSS Coverage reporter
- Get all CSS-in-JS and `<style>` tags with `document.styleSheets`
- Get all inline styles with `document.querySelectorAll('[style]')`
- Combine all chunks of CSS in a single chunk.

### Coverage API

The CSS Coverage API gives us all `<link>` tag CSS (and their `@import`s). It also finds a lot of `<style>` CSS, but not the ones that were created with JavaScript, so we're ignoring those.

```js
await page.coverage.startCSSCoverage()
await page.goto(url, { waitUntil })
const coverage = await page.coverage.stopCSSCoverage()

const links = coverage
	// Filter out the <style> tags that were found in the coverage
	// report since we've conducted our own search for them.
	// A coverage CSS item with the same url as the url of the page
	// we requested is an indication that this was a <style> tag
	.filter((entry) => entry.url !== url)
	.map((entry) => ({
		href: entry.url,
		css: entry.text,
		type: 'link-or-import'
	}))
```

[Source on GitHub](https://github.com/bartveneman/extract-css-core/blob/d365e7f699fe12c71640af8f6dfa572f86d2e14b/src/index.js#L88-L98)

### `document.styleSheets` API

With `document.styleSheets` we have access to all `<style>` tags that were server rendered, client-side rendered and all CSS that was generated with `StyleSheet.insertRule()`, as used in many CSS-in-JS frameworks.

```js
// Get all CSS generated with the CSSStyleSheet API
// This is primarily for CSS-in-JS solutions
// See: https://developer.mozilla.org/en-US/docs/Web/API/CSSRule/cssText
const styleSheetsApiCss = await page.evaluate(() => {
	return (
		[...document.styleSheets]
			// Only take the stylesheets without href, because those with href are
			// <link> tags, and we already tackled those with the Coverage API
			.filter((stylesheet) => stylesheet.href === null)
			.map((stylesheet) => {
				return {
					type: stylesheet.ownerNode.tagName.toLowerCase(),
					href: stylesheet.href || document.location.href,
					css: [...stylesheet.cssRules].map(({ cssText }) => cssText).join('\n')
				}
			})
	)
})
```

[Source on GitHub](https://github.com/bartveneman/extract-css-core/blob/afadea662233a4d865bc728cc0327c38d8aa1c63/src/index.js#L50-L65)

### Inline styles

Now, this part may be a bit controversial, but I think it's worth to look at inline styles as well as all the rest. It's often overlooked, but many WordPress Themes, Magento plugins and other _Big Web Players©_ utilize inline styles for their themes and plugins. There's one catch, though. A CSS Rule consists of one or more selectors and zero or more declarations. The declarations are the ones present in the `style=""`, but there is no selector. That's why I decided to give each individual block of inline styles it's own `[x-extract-css-inline-style]` selector. This way, it's possible to _count_ the amount of inline style attributes after they were extracted from the page.

```js
// Get all inline styles: <element style="">
// This creates a new CSSRule for every inline style
// attribute it encounters.
//
// Example:
//
// HTML:
//    <h1 style="color: red;">Text</h1>
//
// CSSRule:
//    [x-extract-css-inline-style] { color: red; }
//
const inlineCssRules = await page.evaluate(() => {
	return (
		[...document.querySelectorAll('[style]')]
			.map((element) => element.getAttribute('style'))
			// Filter out empty style="" attributes
			.filter(Boolean)
	)
})
const inlineCss = inlineCssRules
	.map((rule) => `[x-extract-css-inline-style] { ${rule} }`)
	.map((css) => ({ type: 'inline', href: url, css }))
```

[Source on GitHub](https://github.com/bartveneman/extract-css-core/blob/afadea662233a4d865bc728cc0327c38d8aa1c63/src/index.js#L67-L87)

### Bringing it all together

The final step is to take the CSS of every step and merge that into one giant chunk of CSS:

```js
const css = links
	.concat(styleSheetsApiCss)
	.concat(inlineCss)
	.map(({ css }) => css)
	.join('\n')
```

That's it! A lot of work to get some CSS off of a page, but so far it's the most reliable way I've found to do it.
