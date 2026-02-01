## Conclusion

That was a wild ride along some of the most-used but also most obscure pieces of CSS usage around the world. The goal of this first edition of Project Wallace's CSS Selection was to have a look at how CSS is being used in the real world and I'm pleased to say that this article has shown us some real eye openers as well as opportunities for mad respect and deep regret.

### A brief note on analytical gaps

After spending dozens of hours analyzing and writing these chapters I found that there are some flaws in my overall analysis that I plan to improve in next editions:

- Better analysis on value comparisons: `red` and `Red` should be marked as the same values for colors, so do `(position: sticky)` and `(position:sticky)` for `@supports` queries.
- There is no correlation analysis: does having lots of embedded content always mean having a bigger file size than usual? Do websites with a large `!important` ratio also have different specificity metrics? This is worth exploring a next time.

A big thanks to our sponsors who have made this first edition possible:

1. Numero uno
2. Numero dos
