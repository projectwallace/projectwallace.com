---
title: New libraries released!
author: bartveneman
excerpt: 'Two new libraries were released that will
contribute to a better and faster API to power the Project
Wallace website.'
---

Today I released two libraries on GitHub that will ultimately power [projectwallace.com](https://www.projectwallace.com)! Both libraries are brand new and take part in replacing a slow PHP API that times out on a lot of CSS files. Because that's such a big and important part of what Project Wallace is, I decided to make the open source. That way our fantastic community will get a chance to contribute to the Project.

## css-collection

This project can be used to get a little more powers with arrays. I often found myself writing functions for sorting, making unique lists and getting the first and last item from a list. This repository takes care of those issues.

See the repository on GitHub: **[css-collection](https://github.com/projectwallace/css-collection)**

## css-analyzer

Here's the real powerhouse of Project Wallace. This repository contains all the stuff that analyses CSS, from rules to values and from at-rules to stylesheet-wide stats. It currently is pretty basic and could definitely benefit from some more async operations, but because of it's simplicity it's pretty easy to maintain. The [css-collection](https://github.com/projectwallace/css-collection) library is used quite a lot in this repository because of all the collections of selectors, values etc. that are in it.

See the repository on GitHub: **[css-analyzer](https://github.com/projectwallace/css-analyzer)**

## Next steps

The last step in replacing the slow PHP API is to write a new API, probably also in Node, since it can use the other projects as dependencies. 💖

In the meantime, keep an eye
on the [Project Wallace GitHub profile](https://github.com/projectwallace) for updates that
will most definitely come.
