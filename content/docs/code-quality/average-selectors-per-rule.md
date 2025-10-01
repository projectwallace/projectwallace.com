---
title: Keep average Selectors per RuleSet low
format: number
unit: Selectors per RuleSet
category: maintainability
---

The average amount of Selectors per RuleSet should be low, to make scanning for the right RuleSet and finding the right Selector easy.

```css
/*
	The avarage amount of selectors per rule is
	(1 + 2 + 3) / 3 = 2 selectors
*/
.selector1 {
	font-size: 1em;
}

.selector1,
.selector2 {
	font-size: 2em;
}

.selector1,
.selector2,
.selector3 {
	font-size: 3em;
}
```
