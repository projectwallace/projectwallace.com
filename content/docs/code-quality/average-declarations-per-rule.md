---
title: Keep average Declarations per RuleSet low
format: number
unit: Declarations per RuleSet
category: maintainability
---

Declaration Block size should be consistent and small to avoid inconsistencies in the CSS, which could make it hard to debug. Scoring high here this means that RuleSets contain many Declarations on average.

```css
/*
	The avarage amount of declarations per rule is
	(1 + 2 + 3) / 3 = 2 declarations
*/
.selector1 {
	font-size: 1em;
}

.selector2 {
	font-size: 2em;
	color: red;
}

.selector3 {
	font-size: 3em;
	color: green;
	text-transform: uppercase;
}
```
