---
title: Selectors of rule(s) with lowest number of selectors
---

A list of the selectors of the rule(s) with the lowest number of selectors.

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

The result of this metric is an array of selectors:

```js
{
	"rules.selectors.minimum.value": [
		"selector"
	]
}
```

## Further reading

- [CSS Rulesets on MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Syntax#CSS_rulesets)
