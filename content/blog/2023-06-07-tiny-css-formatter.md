---
title: Building a lightweight CSS formatter
excerpt: After using Prettier for a while it became apparent that both speed and bundle size were slowing down the CSS auditing process, so it's time to build a faster alternative.
---

<script>
	import example from '$lib/img/blog/2023-06-07-tiny-css-formatter/example.png'
</script>

Last year we introduced a prettifier to this website because it's one of those things you often want to do when auditing CSS. Then, not long after that, we added the option to prettify your CSS before analyzing it. Because we have a DevTools panel now on the analyzer page, it makes sense to view the CSS usage in a formatted manner. But this came at a cost: prettifying the CSS took up to twice as long analyzing the CSS! Time to look at a more performant alternative.

<figure>
	<img alt="Example output of formatted CSS that we need to audit" src={example} loading="lazy" decoding="async" width="856" height="429">
	<figcaption>CSS that is being audited where the source code was originally minified, making the auditing process difficult, because those lines become pretty much unreadable.</figcaption>
</figure>

## The naive way: Prettier

The first iteration of our prettifier used [Prettier](https://prettier.io/), a very popular and respectable project that can pretty-print hundreds of different languages. Even before testing, I was already pretty sure this was going to be a slow function call, so I went ahead and made sure to only import the relevant modules _and_ to put the function in a WebWorker to run it off the UI thread.

```js
// prettify-worker.js
import prettier from 'prettier/esm/standalone.mjs'
import cssParser from 'prettier/esm/parser-postcss.mjs'

// The `event` here is the message we send from the UI to
// the worker and `event.data` contains the string of CSS.
onmessage = function (event) {
	try {
		let result = prettier.format(event.data, {
			parser: 'css',
			plugins: [cssParser]
		})
		// Send result back to UI thread
		postMessage(result)
	} catch (error) {
		postMessage({ error })
	}
}
```

This worked quite well, but after some weeks I noticed more often that the progress back on the analyzer page got stuck on _"prettifying CSS"_ step. It's not necessarily a bad thing, but if you analyze CSS as much as I do it becomes annoying after some time. And since prettifying CSS isn't even our core business (if you can call it that), it's even more frustrating.

## CSSTree to the rescue

After thinking about the problem for a while I realized that I could enlist the help of [CSSTree](https://github.com/csstree/csstree) to do some of the work. The CSS Analyzer is based on CSSTree's AST, so I know how the thing works and the dependency is already on the page, so no need to download more dependencies. Prettier + Postcss cost almost 340kB to download, which isn't huge, but it would be nice if we could reduce that amount.

So how do you turn a string of (potentially minified) CSS into a string of mostly readable CSS with CSSTree? Let's start by parsing the CSS, so we get an AST to work with. Then, using that AST, we apply our knowledge of CSS structure to turn them into readable strings, line by line.

### Fast CSS parsing

CSSTree has some neat parsing options to speed things up a bit. It allows you to skip certain tokens, which will reduce memory usage and all that. The following script creates an AST of our CSS. An example of such an AST can be inspected on [ASTExplorer](https://astexplorer.net/#/gist/0619055be1fcbec410702a63db37806f/59bddd15b3446ba5b4bb5878647c6584b4feb2cf).

```js
let ast = parse(css, {
	positions: true,
	parseAtrulePrelude: false,
	parseCustomProperty: false,
	parseValue: false
})
```

We can skip parsing Atrule preludes, custom properties and values because we're only interested in their 'raw' string values, not the deeper tokens within them. We do need `positions` because this will allow us to do a lot of `css.substring(x, y)` later on.

## Creating a readable string of CSS

With the AST in hand, we can begin thinking about how to turn it into pretty-looking CSS. We need the CSS to be pretty enough to show it in a readable way in our DevTools, not any fancier than that. After some thinking, I came up with the following rules:

1. Every **AtRule** starts on a new line
1. Every **Rule** starts on a new line
1. Every **Selector** starts on a new line
1. A comma is placed after every **Selector** that's not the last in the **SelectorList**
1. Every **Block** (`{}`) is indented with 1 tab more than the previous indentation level
1. Every **Declaration** starts on a new line
1. Every **Declaration** ends with a semicolon (`;`)
1. An empty line is placed after a **Block** unless it's the last in the surrounding block
1. Unknown syntax is rendered as-is

As you can see from this list, we're dealing with a very limited subset of CSS tokens here: Stylesheet, Atrule, Rule, SelectorList, Selector, Block and Declaration. We're starting our formatting from the Stylesheet level:

```js
function print(node, indent_level = 0, css) {
	let buffer = ''

	for (let child of node.children) {
		if (child.type === 'Rule') {
			buffer += print_rule(child, indent_level, css)
			buffer += '\n'
		} else if (child.type === 'Atrule') {
			buffer += print_atrule(child, indent_level, css)
			buffer += '\n'
		} else {
			buffer += print_unknown(child, indent_level, css)
		}
		buffer += '\n'
	}

	return buffer
}
```

This kicks of our prettification, calling `print_atrule` and `print_rule`, which look like this:

```js
function print_atrule(node, indent_level, css) {
	let buffer = indent(indent_level)
	buffer += '@' + node.name

	if (node.prelude) {
		buffer += ' ' + substr(node.prelude, css)
	}
	if (node.block && node.block.type === 'Block') {
		buffer += print_block(node.block, indent_level, css)
	} else {
		// `@import url(style.css);` has no block, neither does `@layer layer1;`
		buffer += ';'
	}

	return buffer
}

function print_rule(node, indent_level, css) {
	let buffer = ''

	if (node.prelude && node.prelude.type === 'SelectorList') {
		buffer += print_selectorlist(node.prelude, indent_level, css)
	}

	if (node.block && node.block.type === 'Block') {
		buffer += print_block(node.block, indent_level, css)
	}

	return buffer
}
```

And this goes on a bit for all the other types as well. There's even some recursion in here because Atrules can be nested (`@media` in `@layer` and CSS nesting, to name a few), so we need to make sure to account for those as well.

If you want to see more: the [source code](https://github.com/projectwallace/format-css/blob/main/index.js) for this can be found [on GitHub](https://github.com/projectwallace/format-css), where I'm currently in the process of making this a standalone NPM package.

## Tradeoffs

No project is perfect and neither is this little script. There are some things that it does well and in a simple fashion, but some things I'll consider beyond the scope and necessity of this package. And that's ok because we just need it to format your CSS well enough to audit it easily.

- ✅ super fast (>90% faster than Prettier)
- ✅ 'tiny' bundle size (~99% smaller than Prettier)
- ✅ prettifies well enough for our use cases
- 🔸 if your source CSS renders things multi-line (like long selectors or values), they'll stay multi-line (fine, I guess)
- 🔺 not as configurable and extensive as Prettier

These are tradeoffs I can live with.
