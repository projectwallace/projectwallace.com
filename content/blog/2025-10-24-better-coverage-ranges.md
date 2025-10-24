---
title: Can we have better CSS Coverage ranges, please?
excerpt:
---

The last couple of months I've been working hard on improving how we can [inspect](/css-coverage/) what parts of CSS are used by the browser and which parts aren't. There's some stuff I'm doing to [make](https://github.com/projectwallace/css-code-coverage) large coverage reports so you can inspect several pages in one go by combining coverage JSON files into a single one, prettifying all the CSS etc. Very fun, very helpful. But there's one thing in particular that is being consistently troublesome for me:

**Browers often don't report atrule ranges correctly.**

'Often' doesn't mean 'always'. But often enough that it has bitten me more than I care to admit. It depends on where in they live and whether neibouring rules are covered. But take this example that I've created using Playwright's [coverage API](https://playwright.dev/docs/api/class-coverage#coverage-start-css-coverage), but I've observed this in Edge/Chrome as well:

```html
<!doctype html>
<html>
	<head>
		<link rel="stylesheet" href="http://localhost/style.css" />
	</head>
	<body>
		<h1>Hello world</h1>
		<p>Text</p>
	</body>
</html>
```

```css
/* style.css */
@media all {
	h1 {
		color: green;
	}
}
@supports (display: grid) {
	h1 {
		font-size: 24px;
	}
}
```

Which parts do you think are marked as covered by the browser? The `@media all {}` rule? Or `@supports (display: grid) {}`. Well yes. No. Both. Neither. Let's look at what the browser/Playwright generates for this:

```js
let coverage = [
	{ start: 7, end: 11 },
	{ start: 14, end: 37 },
	{ start: 50, end: 66 },
	{ start: 69, end: 95 }
]
```

It doesn't mark the whole stylesheet as covered. Instead there are 4 different sections. Let's highlight the bits that the browser says are covered:

1. `all ` (Missing `@media ` and opening `{`)
2. `h1 {\n\t\tcolor: green;\n\t}`
3. `(display: grid) ` (Missing `@supports ` and opening `{`)
4. `h1 {\n\t\tfont-size: 24px;\n\t}`

And both atrule ranges also miss their closing `}`.

## What I want

Can browsers please:

- Include the atrule name in the ranges
- Include the opening _and_ closing brackets (`{}`) in the ranges
- Be smart and then mark my example in a _single_ range covering the whole stylesheet

Thanks.
