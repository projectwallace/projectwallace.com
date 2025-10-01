---
title: Average number of selectors per rule
---

The average number of selectors per rule (RuleSet).

## Examples

```css
/* Rule has 2 selectors */
selector1,
selector2 {
	property: value;
}

/* Rule has 1 selector */
selector {
	property: value;
}
```

The average number of selectors per rule of the example is **1.5** ((2 + 1) / 2).

```js
{
	"rules.selectors.average": 1.5
}
```

## Further reading

- [CSS Rulesets on MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Syntax#CSS_rulesets)
