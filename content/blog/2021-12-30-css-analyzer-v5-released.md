---
title: CSS Analyzer v5 released
excerpt: The core of everything that powers Project Wallace just got a big upgrade. And it's pretty good!
author: bartveneman
keywords: analyzer
---

With a few hours left before the end of the year I am happy to announce that `@projectwallace/css-analyzer` is now on version 5! It is a complete rewrite of the previous version. The TL;DR:

- More metrics added
- Existing metrics are more detailed
- Less dependencies (faster installation)
- Runs faster
- Browser compatible

If you're in a hurry, go grab it [on GitHub](https://github.com/projectwallace/css-analyzer) or run `npm install @projectwallace/css-analyzer`.

## New features 🥳

- The most exciting feature of all: **see where colors are defined!** It's cool to see all the unique colors in a list, but it's even better to see that `background` uses 3 different colors, whereas `color` uses 12!
- Metrics like _selectors per rule_ now have a full list detailing the amount of selectors/declarations per rule. This means you can now graph out these metrics and that's exactly what I'm doing on [the online analyzer](/analyze-css);
- For many metrics I've added the **mean, median, mode, minimum, maximum and sum** of that metric. That means that you can now see what the most common specificity of a selector is, or the highest complexity of a selector, or the maximum amount of selectors in a single rule;
- You can now see all the **CSS units** that are used in the CSS. Whether they are `rem`, `px` or even `vmin`: it's all visible now. And you can even see if `font-size` is using more `px` than `em` or that `transition-duration` only uses `s` instead of `ms` ;)

## Migration from v4 to v5 🪜

- Drop support for Node 8 and 10 (see [Node.js releases](https://nodejs.org/en/about/releases/))
- Rename all metrics ending on `.share` to `.ratio`
  <br>This is only a better word for the exact metric;
- Rename `stylesheets` to `stylesheet`
  <br>Because we're always analyzing exactly one stylesheet;
- Remove `stylesheets.simplicity`
  <br>This is now `rules.declarations.mean`
- Remove `stylesheets.cohesion`
  <br>This is now `rules.selectors.mean`
- Remove `stylesheets.browserhacks.*`, `atrules.supports.browserhacks.*`, `atrules.mediaqueries.browserhacks.*`, `selectors.browserhacks.*`, `values.browserhacks.*`
  <br>These are hard to maintain because they relies on _a lot_ of complex regexes.
- Remove `atrules.documents.*`
  <br>This metric added very little value.
- Drop `atrules.namespace.*`
  <br>This metric added very little value.
- Drop `atrules.page.*`
  <br>This metric added very little value.
- Remove `selectors.js.*`
  <br>This metric added very little value.
- Remove `values.total`
  <br>This is the exact same value as `declarations.total`, so use that one instead;
- Remove `values.colors.duplicate.*`
- Add `rules.selectors` mean/median/mode/etc
- Add `rules.declarations` mean/median/mode
- Add `selectors.specificity.*`
- Add `selectors.complexity.*`
- Add `atrules.keyframes.prefixed.*`

## Dependencies 📦

An upcoming trend in Node land is to have a closer look at the `node_modules` of your project. The running gag is to compare `node_modules` to a black hole, but the undertone is more serious: it has gotten out of hand and many projects face insane install times with all the environmental impact that comes along with that. To turn this trend, projects like [PostCSS](https://twitter.com/sitnikcode/status/1471791895332499456) and [Vite](https://twitter.com/IAmTrySound/status/1475600522572877829) have gone the route of closely inspecting their dependencies and replacing big libraries with smaller alternatives.

For this project it meant getting rid of a whole list of my own dependencies, as well as swapping existing ones with smaller and faster alternatives.
The biggest change in dependencies is that all existing dependencies have turned into a single dependency: `css-tree`. [CSSTree is amazing](https://github.com/csstree/csstree) and I am a big fan of the work of CSSTree's author [Roman Dvornov](https://twitter.com/rdvornov).

For devDependencies, I've replaced Ava with Uvu (by [Luke Edwards](https://twitter.com/lukeed05)). [Uvu is insanely fast](https://github.com/lukeed/uvu) and I find it easier to use than Ava because it doesn't rely on magical global variables.

## Conclusion

Let's hope this new version can serve the community well the next couple of years. The [previous version that ran on PostCSS was released in 2017](/blog/css-analyzer-now-postcss), so I hope there's not another big rewrite for the next couple of years. Enjoy!

Bart Veneman
