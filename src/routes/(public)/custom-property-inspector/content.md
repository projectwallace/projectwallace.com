This analyzer attempts to deeply analyze your CSS Custom Properties. Use it to detect potential bugs or find opportunities to lower your total CSS footprint.

## Catch potential bugs

- Which custom properties are declared but never used in a `var()`?
- Which custom properties are used in a `var()` but were never declared?
- Which properties were registered with `@property` but never used?
- Todo: does the type declared in `@property` (like `<color>` or `<length>`) match up with the way this custom property is used?

## Detect unused code

- Which custom properties are declared but never used in a `var()`? Unused code should be removed to decrease CSS filesize
- Which properties were registered with `@property` but never used?

## Shortcomings

There are some shortcomings in this analyzer:

- The scraper crawls the static HTML of your page only. Properties declared via [`CSS.registerProperty()`](https://developer.mozilla.org/en-US/docs/Web/API/CSS/registerProperty_static) are not recognized. Similarly, usage of properties via [`getComputedStyle(element).getPropertyValue("--my-var");`](https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleDeclaration/getPropertyValue) is not detected
- The scraper only checks a single page at a time, meaning that I cannot detect a custom property being used on another page than it's declared on
- The scraper loads the initial HTML only, so it will not detect if some custom property is only used in a `var()` when someone has interacted with the page
