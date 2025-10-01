---
excerpt: Color aliases accidentally slip into your codebase and now you have multiple notations for the same color. Great, now what?
author: bartveneman
title: Detecting color aliases
---

I love looking at the color-metric pages of projects and I found a pattern while browsing through a bunch of projects. Many of them have multiple notations for the same color, like `#000` and `rgb(0, 0, 0)` that result in the same black color. I'm calling them aliases. I'm pretty sure that these aliases are not intentional, so keeping track of them may help us understand why they appear and how to fix them.

## Examples

First, some examples to show you what I mean by aliases:

- [cloud.google.com](https://www.projectwallace.com/teamwallace/google-cloud/colors#alias)
- [facebook.com](https://www.projectwallace.com/teamwallace/facebookcom/colors#alias)
- [stackoverflow.com](https://www.projectwallace.com/teamwallace/stackoverflowcom/colors#alias)

## What does it mean having aliases in my CSS?

To my experience, this usually means one of the following things:

- **Colors are not standardized in your codebase.**<br>
  Projects like [Tailwind](https://github.com/tailwindcss/tailwindcss/blob/7a5bc9700842b19e6e6e52bf9d5567d9a7782d4e/defaultConfig.stub.js#L30) and [Bootstrap](https://github.com/twbs/bootstrap/blob/928ebd89254300aee284fc78b84c8a57de188d71/scss/_variables.scss#L7) define all their colors in variables and use those variables in the rest of their codebase. As long as you use a variable for any color, it means that you'll always use one of the predefined colors.
- **Code isn't minified at all or temporarily broken.**<br>
  I've seen a couple of cases where websites started serving un-minified CSS, just by looking at their CSS colors. Where they just had `#000` initially, they suddenly added `#000000` too and the same for a lot more colors.
- **A piece of CSS that you don't control is loaded.**<br>
  Very often a piece of CSS is loaded that belongs to a third party plugin or some advertiser. You probably can't control the CSS that is in their source, so if they decide to use `#f00` and you use `red` instead, there's not a lot you can do.
- **Colors are created dynamically.**<br>
  Some developers have a list of base colors, like in the above example of Tailwind. To have a list of shades for every color they apply a transformation to the colors to darken, mix or saturate them. Most preprocessors like Sass, Styles or Less allow you to do something like `mix(#fff, #000, 50%)`. The resulting color might be a color that is already in your definitions, but in a different notation, depending on what the preprocessor decides is best.

## Are aliases bad?

No, they are not. As long as a browser can understand the different color notations and paint them on a screen, I don't see why this could be harmful.

## What's the benefit of fixing aliases?

The most obvious benefit is that you can inspect your codebase outdated or unused pieces of CSS. A certain color notation could be used in only an old part of your application that could be removed entirely.
Secondly, there is the [tiniest benefit in compression](https://csswizardry.com/2016/02/mixins-better-for-performance/) of the CSS file if there are more common substrings. This benefit is negligible, so it should not trigger you to refactor your codebase to remove all aliases.

## How can I fix aliases?

A good CSS minifier should be able to fix most or all aliases. A minifier like [CSSNano](https://github.com/cssnano/cssnano/tree/master/packages/postcss-colormin) parses all colors and tries to use shortest possible notation for each of them.
The second option is to go to your project and manually <kbd>ctrl/cmd + f</kbd> your way through your CSS, but that's probably not such a good idea. It will take a lot of time and the benefits will only be small.
