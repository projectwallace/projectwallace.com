---
title: The PHP CSS project that was released. And abandoned right away.
author: bartveneman
excerpt: Today marks the point where a new PHP CSS parsing/analyzing library is released publicly. And abandoned immediately.
---

Today marks the point where a PHP library accepting incoming HTTP requests, parsing CSS into an Abstract Syntaxt Tree (AST) and analysing it into a hash of statistics was [released on GitHub](https://github.com/projectwallace/php-css-parser-analyser). And abandoned immediately.

The reason was explained in the [previous blog post](/blog/new-libraries-released): it is too slow to process a lot of stylesheets, so work on a NodeJS based system has already started and expected to be ready for use somewhere late this summer. The now published and abandoned PHP library served as a great starter for doing the first stages of this rather large project. It was easy to setup, easy to test and a pain to deploy.

The architecture of the PHP library is a mess, because the single project serves three different purposes:

- A REST API that accepts incoming CSS for analysis and serves historical data for those analysis
- A CSS Parser (based on [Parker](https://github.com/katiefenn/parker)), because it was hard to find a PHP library that parsed CSS into a AST
- A CSS analyser that created an analysis based on the CSS AST

That alone already made the project poorly constructed, but also the less than ideal construction of using an out-of-date version of [Slim](https://www.slimframework.com/) and just not enough knowledge of and care for the PHP syntax made it a recipe for disaster. Everything worked quite well, a lot of tests have been written, but it just didn't cut it. Stylesheets from sites like [CSS-Tricks](https://css-tricks.com/) and [Schiphol Airport](https://www.schiphol.nl/en/) caused the API to time out every time and increasing the timeout to 30+ seconds just didn't make sense. Also, smarter developers will probably say that Dependency Injection, Domain Driven Design, and all that fancy stuff is missing or implemented incorrectly.

So there you have it: a new library that will not be worked on. Hope you enjoy the new one soon!
