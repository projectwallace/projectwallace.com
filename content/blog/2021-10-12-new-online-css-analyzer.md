---
title: New Online CSS Analyzer
excerpt: Project Wallace's online CSS analyzer got a facelift!
author: bartveneman
keywords: analyzer
---

For more than a year I've been working behind the scenes on a complete rewrite of the CSS analyzer that powers all of Project Wallace. Although it's not in a production-ready state, I decided to take it for a test run on [projectwallace.com's online CSS analyzer](https://www.projectwallace.com/analyze-css). And the results were staggering. It's so much more stable than the previous version. This was one of the (many) design goals for the new version, but to see it work out in real life brought absolute joy.

Apart from implementing this new analyzer, I thought it would also be a good time to give the analyzer page a complete overhaul. The new design focuses more on **high-level graphs** and average/median/maximum/minimum numbers for a lot of metrics. And of course, the good-old existing details like the color bar, font-size chart are also still there.

Another new thing is that the analyzer now **runs on your machine** instead of running on a serverless function. Less HTTP roundtrips means better stability and improved performance.
Even low-end devices benefit from running the analyzer locally, because the **analyzer runs in a WebWorker** and doesn't block the main JS thread while doing heavy calculations.

Here's a list of what you can expect from the new online CSS analyzer:

- Charts for getting a quick overview of stylesheet complexity
- A chart for selector complexity
- More concise lists for font-sizes, colors, etc.
- The ability to sort colors, font-sizes, z-indexes, etc.
- Big reduction in errors; You'll only get an error now if your site can't be reached for scraping the CSS.

I really hope you enjoy the new analyzer as much as I do and if you have ideas or suggestions to improve it, let me know [on Twitter via @projectwallace](https://twitter.com/projectwallace)!
