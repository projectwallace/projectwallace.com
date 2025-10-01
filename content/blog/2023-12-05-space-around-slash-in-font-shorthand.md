---
title: Is space allowed around the slash in CSS font shorthand?
excerpt: Everywhere in CSS we see space around the / symbol, but not for the font shorthand. What's up with that?
---

Let's say you're writing a CSS pretty printer and you come across the `/` symbol: what do you do? You add space around it. Except in `font: 16px/1.2 serif;`, because no one ever seems to do it there. This leads me to think: is space around `/` even allowed in the font shorthand and does it actually work?

[Testing](https://codepen.io/bartveneman/pen/yLZGoqY?editors=1100) shows that `16px/2` is the same as `16px / 2` and the spacing seems to work in all major browsers (Safari 17.1, Firefox 119, Chrome 119). The spec also does not seem to mention anything around whitespace, so we're good there too. So why do we write it like this?

I could not find any sources or style guides that dictate the use (or lack) of space of `/` in shorthands, so if you do, please let me know! I guess the lack of space around the slash in the `font` shorthand is just an age-old preference and not commonly applied to other places.

What does this mean for [our CSS formatter](https://github.com/projectwallace/format-css)? Well, I've grown so used to not using spaces in the `font` shorthand that I've written [a single if-statement](https://github.com/projectwallace/format-css/blob/4fd80c7b3e33413ddd01ccfac2626a8912e045f4/index.js#L289-L292) to not add whitespace in that particular scenario. Other cases, like `calc(2em / 2)` and `background: no-repeat center / cover url('image.png');` still get the extra space.
