## Conclusion

That was a wild ride along some of the most-used but also most obscure pieces of CSS usage around the world. The goal of this first edition of Project Wallace's CSS Selection was to have a look at how CSS is being used in the real world and I'm pleased to say that this article has shown us some real eye openers as well as opportunities for mad respect and deep regret.

TODO: finalize + draw actual conclusions.

### Analytical gaps

After spending dozens of hours analyzing and writing these chapters I found that there are some flaws in my overall analysis that I plan to improve in next editions:

- Better analysis on value comparisons: `red` and `Red` should be marked as the same values for colors, so do `(position: sticky)` and `(position:sticky)` for `@supports` queries.
- There is no correlation analysis: does having lots of embedded content always mean having a bigger file size than usual? Do websites with a large `!important` ratio also have different specificity metrics? This is worth exploring a next time.
- Because this is the first edition I haven't done comparisons to other years yet. This is 'the big plan' for upcoming editions. To have a look at how CSS usage evolves as we drop legacy browser support and adopt more modern features.

### Acknowledgements

This article would not have existed without the prior work of all those who contributed to the Web Almanac CSS chapter over the years. Your work is invaluable and let's hope we will get an updated CSS chapter this year.

[Declan Chidlow (vale.rocks)](https://vale.rocks) helped out by meticulously reviewing this article and schooling me in how to write properly. Thank you for that. Go check out that blog, it's awesome.

A tremendous word of thanks to [Kilian](https://kilianvalkhof.com/) from [Polypane](https://polypane.app/) for sponsoring this inaugural edition of The CSS Selection. Your support means the world to me personally, because it encourages me to write about CSS more and to make better tools, like you do yourself. Folks, seriously, if you are not using Polypane yet, you're missing out.
