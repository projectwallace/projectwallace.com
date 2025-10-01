---
title: Sorting CSS <time> values
excerpt: Support for analyzing CSS animations and transitions was added recently, but to display that nicely, animation-durations need to be sorted. Let's dive into sorting time.
author: bartveneman
---

In the [previous blog post](https://www.projectwallace.com/blog/analyzing-animations) I announced that Project Wallace now supports analysis of `animation-duration` and `transition-duration`. One of the neat things about Project Wallace is that it always shows all your values sorted in a sensible way. For example, font-sizes are sorted from small to large, colors are sorted by hue, etc. So it only makes sense to sort CSS [`&lt;time&gt;` values](https://developer.mozilla.org/en-US/docs/Web/CSS/time) from short to long. Enter [css-time-sort](https://github.com/bartveneman/css-time-sort).

## The functional requirements

- Sort durations from short to long
- If a `ms` value is the same as a `s` value, sort the `ms` value first
- Be able to sort an array of `['1s', '200ms']` with the native `.sort()` method

With this relatively simple piece of code it's possible to sort an array of CSS durations like so:

```js
const { sortFn } = require('css-time-sort')
const sorted = ['1s', '200ms'].sort(sortFn)

// RESULT:
// => ['200ms', '1s']
```

Check out the [source code on GitHub](https://github.com/bartveneman/css-time-sort).
