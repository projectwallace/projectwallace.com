---
title: Selectors of rule(s) with highest number of selectors
---

A list of the selectors of the rule(s) with the highest number of selectors.

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

The result of this metric is an array of selectors:

```js
{
	"rules.selectors.maximum.value": [
		"selector1",
		"selector2"
	]
}
```

## Further reading

- [CSS Rulesets on MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Syntax#CSS_rulesets)
