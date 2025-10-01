---
title: Integrating Constyble into your build process
excerpt: Integrating Constyble into your build process will help you automate complexity testing for CSS. This post explains how to do that.
author: bartveneman
---

Integrating [Constyble](https://github.com/bartveneman/constyble) into your build process will help you automate complexity testing for CSS. Depending on how you actually integrate, it will fail your build if some unexpected complexity is detected. And with the [latest release](https://github.com/bartveneman/constyble/releases/tag/v1.1.0) error output is even more clear, so fixing those issues should be a lot easier. Let's dive in.

## Constyble configuration

For Constyble to do its job, we need a config file and some CSS to run our test against. The CSS part should be easy. You probably already do some kind of processing your CSS into a final <code>.css</code> file. We use that CSS file to run our tests against. Constyble by itself does not know what to check, so we need to provide a configuration with thresholds. Here is a small piece of a configuration I use for Project Wallace itself:

```json
{
	"selectors.identifiers.average": 1.45,
	"values.colors.totalUnique": 25,
	"values.colors.unique": [
		"hsl(0, 70%, 42%)",
		"hsl(42, 100%, 55%)",
		//... [truncated] ...
		"hsl(0, 0%, 0%)",
		"rgba(0, 0, 0, 0)"
	]
}
```

In short, I expect the average selector to not contain more than 1.45 identifiers. And no more than 25 unique colors and no other colors than the ones I provided. [Check the Constyble readme](https://github.com/bartveneman/constyble#usage) if you want to know more about setting up Constyble.

## CI configuration

For Constyble to become most effective, we need to run it after we've created a Pull Request. If someone makes a change to our CSS that increases the complexity, we need to prevent that change from being added to our codebase, or update our Constyle config accordingly.

The 'trick' is to run Constyble in your NPM <code>test</code> script. It will look something like this <code>package.json</code>:

```json
{
	"name": "my-package-name",
	"scripts": {
		"test": "constyble styles/main.css"
	},
	"devDependencies": {
		"constyble": "^1.1.0"
	}
}
```

Here is [an example repository](https://github.com/projectwallace/constyble-continuous-integration-example) that includes the example above. This example repo has an integration with [Travis](https://travis-ci.com), so that every push and Pull Request will run the <code>npm test</code> script to validate that CSS changes do not exceed the thresholds set in <code>.constyblerc</code>.

That's all there is to it. Do you find this a useful addition to your tool chain? Let me know [via Twitter](https://twitter.com/bartveneman)!
