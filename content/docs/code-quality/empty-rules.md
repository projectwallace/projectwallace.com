---
title: Remove empty RuleSets
unit: empty RuleSets
format: number
category: performance
---

Empty RuleSets do not contribute to any styling and should be removed. Keeping these RuleSets will make your page (slightly) slower because they still have to be transferred over the network, although they will have no effect on the page.

```css
/* Example empty rule */
.my-selector {
	/* Nothing here */
}
```
