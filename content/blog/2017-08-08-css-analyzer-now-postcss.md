---
title: Project Wallace CSS Analyzer is now on PostCSS
author: bartveneman
excerpt: We've switched to PostCSS for generating the AST for our analysis, and did some other fixes under the hood too.
---

So you start making a brand new [CSS analyzer](https://github.com/projectwallace/css-analyzer) and you're all fired up to get to work on it. You find a CSS parser, transform the [AST](https://en.wikipedia.org/wiki/Abstract_syntax_tree) into some kind of statistics and there you go: your own pretty little analyzer! But... in this case I made a mistake very soon in the process: choosing [Reworkcss](https://github.com/reworkcss/css) over [PostCSS](http://postcss.org/), because PostCSS seemed so much harder to work with. Of course I was wrong.

## The old way

1. **Let Reworkcss transform the [CSS into an AST](https://github.com/reworkcss/css#ast);**
1. **Analyze the AST, including making the AST simpler in some cases;**
   For example, Reworkcss creates an AST that reflects the actual tree structure of the CSS file, so nested Media Queries could appear, nested rules and many more complex structures. This is ok if you want to do some in-depth analysis of things, but for a quick analysis it's easier to have a flat structure, like PostCSS does. In the case of using Reworkcss we have to do [some recursion](https://github.com/projectwallace/css-analyzer/commit/e5504e1226b607e6af0ab0668fcd96511f1553c6#diff-dc17ef0e9b58ca9c3ecde125925b6d41L8) at a couple of places to make sure that we don't miss out on some (edge) cases.
1. **Unit tests for analysis;**
   Only test the output of the whole application, without intermediate steps for the parser for example. If something in the parser fails, it'll fail in the eventual output. That's not the right way to approach it.
1. **Done.**

## The new way

1. **Let PostCSS create a [flat AST](http://api.postcss.org/Root.html);**
   And flat means that there's no need to worry about nesting or other complex structures. When asking for all Media Queries, it returns all Media Queries, regardless of the document structure. That's exactly what we need.
1. **Transform the AST a tiny bit into something a little more suitable for analyzing;**
   By creating an intermediate layer for the AST, we're able to write tests for it and we're making it easier to switch between parsers, because they will all be turned into simple arrays of strings of tiny objects.

1. **Run tests for the analyzable AST;**
1. **Analyze the CSS;**
   Run the analysis on the simple arrays and objects created in step 2.
1. **Run tests for the analysis;**
1. **Done!**

PostCSS is actually easier to work with than Reworkcss because of the ease of which you can get _all_ rules, instead of having to go through the whole document yourself. It pays off to split even a relatively small application like this one into multiple layers to increase testability and maintainability. Have fun using [Project Wallace CSS Analyzer](https://github.com/projectwallace/css-analyzer)!
