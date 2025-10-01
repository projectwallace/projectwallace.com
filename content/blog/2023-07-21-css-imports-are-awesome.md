---
title: CSS @imports are awesome
excerpt: CSS imports have been popping up a lot lately for me so I thought it's time to have a deeper look a t them. Was not disappointed!
---

One of the most inspirational things lately is to watch at [Adam Argyle's](https://nerdy.dev/) side projects and see how he's doing some really nerdy CSS work. It was [somewhere in his work](https://codepen.io/argyleink/pen/PoxQrNj) where I found it, in all it's glory. Waiting to be explored, a rich journey ahead, anxious for the CSS developer community's love and approval. It's everyone's favorite CSS at-rule: `@import`!

Triggered by my feature requests for project Wallace to extract media queries and supports rules from imports, I started reading into the humble rule. And then Romain [started a repository](https://github.com/romainmenke/css-import-tests) with a bunch of browser and bundler tests to verify different levels of support. In this day of the componentized web and scoped styling solutions it's grown out of favour. For years we've been told to [avoid `@import`](https://csswizardry.com/2017/02/code-smells-in-css-revisited/#css-import) for performance reasons. But if you take a closer look, you'll find that `@import` is **packed** with a ton of features that actually make you want to use this bad boy.

1. [Flexible URL syntax](#flexible-syntax-url-url-or-url)
1. [Cascade Layers](#cascade-layers)
1. [Conditional imports: `supports()`](#supports-in-import)
1. [Conditional imports: media queries](#media-queries-in-import)

## Flexible syntax: `"url"`, `url('')`, or `url()`

The most important thing an `@import` needs to do is to import CSS rules some location. The location part here is quite important to the at-rule, so luckily it's very easy to write the URL correctly. Right?

Well. Let's have a look at these examples:

<!-- prettier-ignore -->
```css
@import 'https://example.com/style.css';
@import "https://example.com/style.css";
@import url(https://example.com/style.css);
@import url('https://example.com/style.css');
@import url("https://example.com/style.css");
```

<!-- end-prettier-ignore -->

Yup, they're all the same thing. Even the one wrapped within `url()` with no quotes at all! Apparently there are [legacy reasons](https://drafts.csswg.org/css-values-4/#urls) to allow that. The spec also says this:

> Some CSS contexts (such as `@import`) also allow a `<url>` to be represented by a bare `<string>`, without the function wrapper. In such cases the string behaves identically to a `url()` function containing that string.

It's good to know that there's at least 5 different ways to specify the URL for `@import`. Look at you being all flexible.

## Cascade Layers

Next up: one of the best additions to CSS in recent years: Cascade Layers! This has me all excited because Bramus gave a thrilling talk at CSS Day last year about it's workings and capabilities. And then I saw Adam's CodePen profile packed with example usage of `layer()` in `@import`. Here's three from the Pen I linked in the intro:

```css
@import 'https://unpkg.com/open-props' layer(design.system);
@import 'https://unpkg.com/open-props/normalize.min.css' layer(demo.support);
@import 'https://unpkg.com/open-props/buttons.min.css' layer(demo.support);
```

Because `@import` needs to be defined at the top of the document it can be troublesome to let the CSS end up in the correct layer, but the import sytax filled that gap by allowing you to specify which layer you want to put the imported rules in. If you know how `@layer` works, you can probably tell that his layering system looks something like this:

```css
@layer design {
	/* ... */

	@layer system {
		/* ... */
	}
}

@layer demo {
	/* ... */

	@layer support {
		/* ... */
	}
}
```

These were all named layers, but you can also import into an anonymous layer. It is allowed to specify layers before imports, so you could also name you layers first and then specify your imports:

```css
@layer design.system, demo.support;
@import 'https://unpkg.com/open-props' layer(design.system);
@import 'https://cookie-consent-stinks.com/bad-css-1.css' layer;
@import 'https://marketing-junk.com/bad-css-2.css' layer;
```

Now that last import's rules will be assigned to a new, anonymous layer. The benefit here is that the bad CSS in each of these imports will be contained withing their own layers and don't leak out to the other layers. This might save you a bunch of headaches down the road.

### Browser support

It seems like [`layer` browser support in imports](https://caniuse.com/mdn-css_at-rules_import_supports) has been around for for over a year already. They probably picked this up right alongside developing initial `@layer` efforts.

The `<link>` element [does not (yet) support](https://twitter.com/bramus/status/1593376033725591552) importing into a layer, so if you really must add some 3rd party CSS into a layer, this is your bet. For now. Keep an eye on [this GitHub thread](https://github.com/whatwg/html/issues/7540) if you want to know if and when support is coming.

## Import conditions

Just like how `@import` cannot be nested inside `@layer`, you also can't conditionally load CSS by writing `@import` inside an `@supports` or `@media`. But you **can** conditionally load CSS by appending your supports or media query to the end of the import rule.

## `supports()` in `@import`

You can append a `supports()` supports-condition to an import to only import the specific CSS in case the supports-condition is met. The spec has a pretty cool example where they load a fallback stylesheet in case the browser does not support flexbox.

```css
@import url('fallback-layout.css') supports(not (display: flex));

@supports (display: flex) {
	/* ... */
}
```

You could think of this import as this (although this is not valid and will not work):

```css
/* Mental picture only, this does not work and is not valid CSS */
@supports not (display: flex) {
	@import url('fallback-layout.css');
}
```

[MDN goes a step beyond](https://developer.mozilla.org/en-US/docs/Web/CSS/@import#importing_css_rules_conditional_on_feature_support) that and loads this CSS only if `display: flex` is supported and `display: grid` is not:

```css
@import url('flex-layout.css') supports(not (display: grid) and (display: flex));
```

The supports-condition is worthy of it's own blog post, because the amount of checks you can do there is absolutely wild. Check out [the examples over at MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/@supports#examples) if you want to see some really cool stuff.

### Browser support

It seems that [only Firefox has shipped support](https://caniuse.com/mdn-css_at-rules_import_supports) for `supports()` in `@import` at the time of writing. And only two weeks ago. Sad trombone.

## Media queries in `@import`

This is one that most developers might actually be familiar with: specifying a media query list to conditionally load CSS. Again some examples:

```css
@import url('desktop.css') (min-width: 1024px);
@import url('print.css') only print;
@import url('dark.css') screen and (prefers-color-scheme: dark);
```

Let's make a mental model of this, as with the previous section:

```css
/* Mental picture only, this does not work and is not valid CSS */
@media (min-width: 1024px) {
	@import url('desktop.css');
}

@media only print {
	@import url('print.css');
}

@media screen and (prefers-color-scheme: dark) {
	@import url('dark.css');
}
```

### Browser support

I can't find any notes for media query list as a separate thing to supported alognside `@import`, so I'm going to assume here that support has been around since the early days of CSS imports.

## Mixing it up

Now we've seen some pretty incredible features of `@import`, but we can combine all of them! I don't know if anyone would ever need something like this, but I guess this is something you could do (but not saying you should):

<!-- prettier-ignore -->
```css
@import url('desktop-fallback.css') layer(base.elements) supports(not (display: grid) and (display: flex)) only screen and (min-width: 1024px);

/* Mental picture of the above import */
@supports (not (display: grid) and (display: flex)) {
	@media (only screen and (min-width: 1024px)) {
		@layer base {
			@layer element {
				/* CSS of desktop-fallback.css here */
			}
		}
	}
}
```

<!-- end-prettier-ignore -->

This example does not make a ton of sense, but I bet there are some real-world scenarios that we could solve with clever combinations of import conditions and layers. Even more so with the addition of [more `supports()` capabilities](https://developer.mozilla.org/en-US/docs/Web/CSS/@supports#function_syntax) and added [media features](https://developer.mozilla.org/en-US/docs/Web/CSS/@media#media_features).

---

See!? I told you! This at-rule is full of good stuff. After diving into this I'm mostly left with questions though.

- Does anyone actually use this? At what scale?
- Do modern CSS parsers support all these new conditions and layers?
- Will browsers pick up support for `supports()`?
- What would be a good trigger for us to start using `@import` again. There's probably a way to mitigate some of the [performance drawbacks](https://gtmetrix.com/avoid-css-import.html), right?
- ~~I remember seeing a GitHub thread of some CSS working group around adding support for `layer` and `supports` in the `<link>` element, but I can't seem to find the relevant issue. If you know where it is, please send me a message, because I think that really fits the theme here as well.~~
  Thanks for [tweeting](https://twitter.com/bramus/status/1593376033725591552) Bramus and Barry!

Some of this is just more research material that I haven't got to yet. I'd love to know more about `@import`, so I encourage you to [mail](mailto:bart@projectwallace.com?subject=CSS%20at-import) or [tweet](https://twitter.com/projectwallace) me some good reading material.
