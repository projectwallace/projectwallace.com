---
title: Maximum number of selectors per rule
---

The number of selectors in the rule(s) with the highest amount of selectors.

## Example

```css
/* 1 selector */
selector {
	property: value;
}

/* Highest number of selectors: 2 */
selector1,
selector2 {
	property: value;
}
```

The result of this metric is **2**, because the second ruleset has **two** selectors.

```js
{
	"rules.selectors.maximum.count": 2
}
```

## Further reading

- [CSS Rulesets on MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Syntax#CSS_rulesets)
