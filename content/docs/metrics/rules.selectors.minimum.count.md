---
title: Minimum number of selectors per rule
---

The number of selectors in the rule(s) with the lowest amount of selectors.

## Example

```css
/* 1 selector (this is the minimum) */
selector {
	property: value;
}

/* 2 selectors */
selector1,
selector2 {
	property: value;
}
```

The result of this metric is **1**, because the first ruleset has **one** selector.

```js
{
	"rules.selectors.minimum.count": 1
}
```

## Further reading

- [CSS Rulesets on MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Syntax#CSS_rulesets)
