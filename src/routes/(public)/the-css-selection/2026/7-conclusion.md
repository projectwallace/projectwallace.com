<script>
import PolypaneBanner from './PolypaneBanner.svelte'
</script>

## Conclusion

That was a wild ride along some of the most-used but also most obscure pieces of CSS usage around the world. The goal of this first edition of Project Wallace's CSS Selection was to have a look at how CSS is being used in the real world, and I am pleased to say that this article has shown us some real eye-openers as well as opportunities for mad respect and deep regret.

What stands out most to me is the adoption rate of various newish features in CSS, like `@container`, `:where` and `:has`. On the other hand, adoption of great features, like `@supports` and `@layer`, seems to lag behind. Perhaps this is my bias towards my own authoring style, but I expected the balance to be more in favor of the old-but-good.

Looking at the bigger picture, I expected the overall state of global CSS usage to be a lot worse than it is. Perhaps that stems from the fact that people send me their worst websites to analyze, and that causes my bias to shift towards a negative outlook. On the other hand, there is still a lot of improvents that could be easily made, if people would just look at the CSS they send to their customers' browsers. I am tooting my own horn here, obviously, but if you occasionally analyze your website using Project Wallace, you'll always find a couple of spots that could be improved.

### Analytical gaps

After spending dozens of hours analyzing and writing these chapters, I found that there are some flaws in my overall analysis that I plan to improve in future editions:

- Do deeper analysis on comparing string-based values: `red` and `Red` should be marked as the same values for colors, as should `(position: sticky)` and `(position:sticky)` for `@supports` queries.
- There is no correlation analysis: does having lots of embedded content always mean having a bigger file size than usual? Do websites with a large `!important` ratio also have different specificity metrics? This is worth exploring next time.

### Next editions

- Because this is the first edition, I haven't done comparisons to other years yet. This is 'the big plan' for future editions: to have a look at how CSS usage evolves as we drop legacy browser support and adopt more modern features.
- For the next edition I'll use a more realistic scraper, probably based on a headless browser. Our current scraper fetches static HTML, parses it to get CSS resources and downloads each of them. A headless browser would yield more realistic results, because it is able to see the actual network requests, even the ones initiated by JavaScript.
- Continuing on the last point: if we're going to use a headless browser, then we can also look at [CSS coverage analysis](https://www.projectwallace.com/css-coverage).
- Multiple suggestions came in through the review process, some of which we might incorporate into upcoming editions: comparing usage of `grid` and `flex`; analyzing `@scope` and `:scope`; analyzing adoption ratios of pseudo-elements and attribute selectors; looking for adoption ratio of the PostCSS `@layer` polyfill; Web component selectors: the list goes on and on!

### Acknowledgements

This article would not have existed without the prior work of all those who contributed to the Web Almanac CSS chapter over the years. Your work is invaluable, and let's hope we will get an updated CSS chapter this year.

[Declan Chidlow (vale.rocks)](https://vale.rocks) helped out by meticulously reviewing this article and schooling me in how to write properly. Thank you for that. Go check out that blog, it's awesome.

A tremendous word of thanks to [Kilian](https://kilianvalkhof.com/) from [Polypane](https://polypane.app/) for sponsoring (and reviewing) this inaugural edition of The CSS Selection. Your support means the world to me personally, because it encourages me to write about CSS more and to make better tools, like you do yourself. Folks, seriously, if you are not using Polypane yet, you're missing out.

<PolypaneBanner></PolypaneBanner>
