---
title: Counting Lines of Code in CSS
excerpt: Project Wallace introduces Lines Of Code for CSS. Compare projects or files based on the amount of lines of code, instead of file size or guesswork.
author: bartveneman
---

After using Project Wallace for quite some time, I found it hard sometimes to compare projects. For example, Facebook.com&rsquo;s CSS is way larger than that of Twitter.com, but that&rsquo;s because it has some base64-encoded fonts inlined in their `@font-face` declarations and parts of either website aren&rsquo;t minified. So what is the best option to compare project sizes at a glance? Other programming languages have figured this out before: the Lines Of Code metric.

## What is Lines Of Code

[From Wikipedia](https://en.wikipedia.org/wiki/Source_lines_of_code):

> Source lines of code (SLOC), also known as lines of code (LOC), is a software metric used to measure the size of a computer program by counting the number of lines in the text of the program's source code.

So we use SLOC to determine the size of bunch of code. This works for CSS too! Let&rsquo;s discuss LOC and SLOC in relation to CSS.

## Lines Of Code for CSS

Lines of Code in relation to CSS is basically all your CSS, split by newlines. It actually just is that for Project Wallace. Checkout [the source code](https://github.com/projectwallace/css-analyzer/blob/f7e913594f041d07c0a6c4913f8fca614c2e5d23/src/analyzer/stylesheets/lines-of-code.js#L4) for that:

```js
const splitLines = require('split-lines')
const totalLinesOfCode = splitLines(rawCss).length
```

Note that [`splitLines()`](https://github.com/sindresorhus/split-lines) is basically `string.split(/\r?\n/)`.

## Source Lines of Code for CSS

There are three things in CSS that are important to keep track of when counting lines:

- At-Rules (@media queries, @font-face rules, @keyframes rules, etc.)
- Selectors (`#header`, `.some-list`, `h1 > span`)
- Declarations (`color: blue`)

You might wonder why rules aren&rsquo;t counted here, but rules only consist of selectors and declarations.
The [source code for counting Source Lines Of Code in CSS](https://github.com/projectwallace/css-analyzer/blob/f7e913594f041d07c0a6c4913f8fca614c2e5d23/src/analyzer/stylesheets/lines-of-code.js#L5-L6) is seemingly simple as well:

```js
const totalSourceLinesOfCode = atRules.length + selectors.length + declarations.length
```

Here is a practical example of counting Lines Of Code in CSS:

```css
/* 2 Source Lines Of Code */
.selector {
	color: blue;
}

/* 4 Source Lines Of Code */
.selectorA,
#selectorB {
	color: red;
	border-radius: 3px;
}

/* 5 Source Lines of Code */
@media (min-width: 400px) {
	.selector,
	.another-selector {
		color: green;
		background: yellow;
	}
}

/* 4 Source Lines of Code */
@media (min-width: 400px) and (max-width: 800px) {
	@supports (display: grid) {
		.deep-selector {
			color: tomato;
		}
	}
}
```

## Closing thoughts

There is still a lot more counting to do, but with regards to Lines Of Code, this is pretty much it. The next step for [@projectwallace/css-analyzer](https://github.com/projectwallace/css-analyzer) is to calculate the cyclomatic complexity for CSS. But that&rsquo;s a whole different can of worms.
