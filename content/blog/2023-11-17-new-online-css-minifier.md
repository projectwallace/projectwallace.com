---
title: A new online CSS minifier
excerpt: We all need that quick online CSS minifier every once in a while, so new we have our own.
---

_TL;DR: Project Wallace has it's own [CSS Minifier](/minify-css)!_

Manually minifying CSS is one of those tasks you run into every once in a while. Sometimes it's just too much work to setup a bundler or some script to do it for you, so you quickly do a search for an online CSS minifier and pick the first one.

Now, with more CSS tools on this website than pretty much anywhere else, it only makes sense that we have our own page for compressing your CSS as well. Not because we think we do the best job (certainly not), but because for those quick scenarios it's usually good enough to remove most whitespace and CSS comments. And that's exactly what our minifier does:

- remove whitespace
- remove comments
- render all CSS on a single line
- it all runs in your browser; no data is sent to us, so your privacy is guaranteed

---

Like it says on the page: if you need more thorough minification, you'll need to look at some of the great solutions out there, because they will remove empty rules and atrules, minify colors, strip unnecessary units where possible and so, so much more:

- [LightningCSS](https://lightningcss.dev/)
- [CSSO](https://github.com/css/csso)
- [cssnano](https://github.com/cssnano/cssnano)

We chose not to do that, because there are a lot of intricate problems to solve with removing parts of CSS, replacing values and rewriting rules. We choose to go for a small, fast, client-side solution. The projects listed above are separate projects, maintained by excellent people who spent a lot of time on improving their setups in ways that we never could.
