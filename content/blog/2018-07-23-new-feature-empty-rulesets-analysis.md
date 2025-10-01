---
title: 'New feature: empty rulesets analysis'
author: bartveneman
excerpt: 'It is a tiny new feature, but starting now you can analyze how many empty rulesets your CSS contains.'
---

When I was scrolling to some of my competitors' websites, I noticed that [analyze-css](https://www.npmjs.com/package/analyze-css) by [Maciej Brencz](https://github.com/macbre) was counting the amount of empty rules in your CSS. It seemed to me that this was easy to add to Wallace, so I did it in a short amount of time. Here is the explanation that will eventually end up in the docs in some form:

> A rule (or ruleset) is considered empty when it contains no declarations. Whitespace is ignored when determining whether a rule is empty or not.

## Examples

```css
/* This is an empty rule */
.header {
}

/* This is also an empty rule */
.header {
}

/* This is not an empty rule */
.header {
	margin: 10px;
}
```

Please note that at-rules are not part of this analysis, so an empty media query rule is not counted here. That might be a future improvement.

Finally, a [link to the commit](https://github.com/projectwallace/css-analyzer/commit/effc01cc4777d1d0e0a91bd0125e1b0013c618af) that contains this change.
