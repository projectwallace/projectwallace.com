---
title: Avoid larger than common SelectorLists
unit: Selectors per RuleSet (most common)
format: number
category: maintainability
---

SelectorList length should be consistent and small to avoid inconsistencies in the CSS, which could make it hard to debug. Scoring high here this means there are a lot of SelectorLists that are longer than what's most common in the CSS.

```css
selector1 {
} /* length = 1 */
selector2 {
} /* length = 1 */
selector3 {
} /* length = 1 */

selectorA,
selectorB,
selectorC,
selectorD,
selectorE {
} /* length = 5 */
```
