---
title: Total empty rules
---

The total number of empty rules (RuleSets). A rule is considered empty when it contains no declarations. Whitespace and comments are ignored when determining whether a rule is empty or not. Atrules are not part of this analysis, so an empty media query rule is not counted here.

## Examples

```css
/* This is an empty rule */
.header {
}

/* This is also an empty rule */
.header {
	/* Nothing here */
}

/* This is not an empty rule */
.header {
	margin: 10px;
}

/* This is also no an empty rule, but an empty atrule */
@media (all) {
}
```

## Why empty rules are bad

Empty rules have no effect other than being extra information to download and process for the browser.

Some tools warn against the presence of empty rules. For example, Visual Studio Code shows a warning when a CSS rule is empty: `Do not use empty rulesets css(emptyRules)`. Although this can be disabled in the [user settings](https://code.visualstudio.com/docs/getstarted/settings) with setting `css.lint.emptyRules` to `ignore`, it's best to not have empty rulesets for performance reasons.

## Further reading

- [New feature: empty rulesets analysis](/blog/new-feature-empty-rulesets-analysis)
- [CSS Rulesets on MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Syntax#CSS_rulesets)

## Related StyleLint Rules

- [block-no-empty](https://stylelint.io/user-guide/rules/block-no-empty)
