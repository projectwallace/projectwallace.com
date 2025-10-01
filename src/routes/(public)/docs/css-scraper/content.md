# CSS Scraper Agent

## Purpose

This bot fetches and analyzes public-facing CSS from websites to generate metrics for https://www.projectwallace.com. It does _not_ interact with JavaScript, cookies, or private content.

## User-Agent string

```txt
Project Wallace CSS Scraper/1.1 (+https://www.projectwallace.com/docs/css-scraper)
```

## Behavior

- **Resources accessed**:
  - `.css` files linked in HTML `<link>` tags
  - `<style>` tags present in HTML
  - `.css` files linked in other CSS files via `@import` or within `<style>` tags
  - inline styles via `style="..."` attributes on HTML elements
- **Fetch method**: HTTP GET only
- **Rate**: As often as users enter a specific URL.
- **Timeouts**: 10s per group of requests (1 HTML with 10 linked stylesheets is considered a single group)
- **Request Headers**:
  - Accept: `text/html,*/*;q=0.1` and `text/css,*/*;q=0.1`,
  - User-Agent (as described above)
- **Redirects** Follows redirects
- **Cache** Results are cached at CDN level for 10 minutes

## Opting Out

Opting out is currently not possible.

If you really need to prevent this bot to access your site you can password protect it our put a firewall in place. If the crawling is causing issues feel free to reach out so we can implement measures to prevent it.

## Contact

bart [at) projectwallace (dot] com

## Changelog

### 1.1 (13-07-2025)

- Rename to `Project Wallace CSS Scraper/1.1 (+https://projectwallace.com/docs/css-scraper)`
- Add this documentation page
- Abort (sub)request groups taking longer than 10 seconds

### 1.0

Initial release as `Project Wallace CSS Analyzer/1.0 (+https://projectwallace.com)`
