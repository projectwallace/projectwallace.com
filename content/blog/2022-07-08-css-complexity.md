---
title: "CSS complexity: it's complicated"
excerpt: There's lots of places in CSS to have complexity, but we tend to focus on selectors most of the time. Let's have a look at other places too.
author: bartveneman
---

Years ago I read a [blog post by Harry Roberts about Cyclomatic Complexity in CSS](https://csswizardry.com/2015/04/cyclomatic-complexity-logic-in-css/). You know, one of those classic Computer Science metrics that traditionally only classically trained engineers get to use. And for years this has me thinking that **with CSS we also need a way to express cyclomatic complexity**.

There are many occasions where someone will audit the codebase and will want to know the overall state of the code, detect weak spots and find outliers. The proof of that in the many visitors on this very website that check their [CSS analytics](/analyze-css) or [Code Quality](/css-code-quality). And to my knowledge there doesn't exist a tool that give you hints about the complexity of your CSS and I am convinced that we need this.

And then came [Bramus at CSS Day 2022](https://www.bram.us/2022/06/28/the-css-cascade-a-deep-dive-2022-06-09-css-day/), who told us that most CSS architecture solutions like BEM and ITCSS are primarily aimed at _selectors_ and the struggle with the cascade. This has been stuck in my head ever since. It makes so much sense: selectors are usually the frustrating part of the _authoring_ experience (opposed to the _debugging_ experience). Once you have a specific enough selector, you keep adding declarations until it looks good.

## Selector complexity beyond specificity

Some recent additions to CSS have made it easier to deal with specificity issues, like `:where()` and `:is()`. Both give us the opportunity to write more complex selectors at the cost of little specificity added (or none, in the case of `:where()`). But they can make selectors **more complex**. Let's take a look at these two examples:

```css
/* specificity: 0,1,2 */
:is(header, main, footer) p:hover {}

/* specificity: 0,1,2 */
header p:hover {}
```

[Specificity for both selectors is `0,1,2`](<https://polypane.app/css-specificity-calculator/#selector=%3Ais(header%2C%20main%2C%20footer)%20p%3Ahover%2C%20header%20p%3Ahover>), but I'd argue that **the first one is more complex** than the second, because of the arguments in `:is()`. For me there's at least 6 parts to this selector, instead of the 3 (2 + 1) that the specificity would hint at. This is one example of specificity being not enough to explain the complexity of a selector.

## More than just selector complexity

Rarely do we talk about the 'hidden' complexity in CSS. The complexity that becomes visible when _debugging_. This is where the order of things comes into play, as well as things like RuleSets being nested inside at-rules, like `@media` or `@supports` or soon `@container`, but also vendor prefixes and [browser hacks](http://browserhacks.com/) being used in selectors, properties, values, at-rule conditions. And you probably didn't author some of these, but they were added by Autoprefixer, PostCSS, Sass or ParcelCSS and now there's even more code to dig through! Even `@layer` will not save us from all the nasty stuff that's tucked away in these rules, because it will only help with controlling the cascade, which in itself is another form of adding complexity.

My goal is to work on a complete list and implement all these into Project Wallace's analyzer, so we can all inspect the things we've made. [Here's a list of things](https://github.com/projectwallace/css-analyzer/issues/218) I'm considering to add to CSS complexity:

- Atrules
  - `@import` can include media queries, supports conditions and a layer: `@import url(reset-mobile.css) supports(not (display: flex) and screen, (min-width: 1000px) layer(reset);`
  - `@supports` can contain vendor prefixes: `@supports (-webkit-appearance: none) {}`
  - `@keyframes` can be vendor prefixed: `@-webkit-keyframes {}`
  - `@media` can be a browserhack: `@media \\0 screen {}`, `@media screen\9 {}`
- Selectors
  - Attribute/value selectors: `[type]`, `[type=text]`
  - Vendor prefixes: `-moz-any(p)`
  - Combinators: `.item ~ .sibling`
  - Forms: `input[type="tel"]:invalid:not(:focus):not(:placeholder-shown) + label`
- Declarations:
  - Usage of `!important`
- Properties:
  - Vendor prefixes: `-webkit-appearance`
  - Browserhacks: `*zoom`
  - Custom properties: `--brand-surface` (I'm actually still undecided if this should count towards complexity, so I'd love to hear your thoughts. Again, [Bramus shows](https://twitter.com/bramus/status/1363842359918800898) us there's definitely a complexity cost to pay in some circumstances and [Lea Verou's talk](https://www.youtube.com/watch?v=ZuZizqDF4q8) also highlighted that custom properties can be really powerful, but that power comes with a complexity cost)
- Values
  - Browserhacks: `10px !ie`, `green \9`
  - Vendor prefixes: `-webkit-linear-gradient()`

See? There are so many things! At first I thought it would be a little far fetched to start looking into these, but when I started working on selector complexity metrics a long time ago I noticed that many websites have plenty enough of any of these complexity issues going on. So I'm really looking forward to experimenting with this and what insights it will bring to us.

On a closing note: I think Project Wallace is the most powerful tool to explore your CSS, but I also think that browser makers should step up their game here. Google Chrome had a nice start with their [CSS Overview](/blog/css-analytics-in-chrome-devtools), but I think the topic is still largely overlooked and developers are looking for ways to learn more about their CSS, beyond looking at the different colors and fonts.

**Special thanks to [Bramus van Damme](https://www.bram.us/) for proof-reading this post!**
