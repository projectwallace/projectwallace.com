## Research method

This article used the following methodology:

- Use the [Majestic Million list](https://majestic.com/reports/majestic-million) to get the top ~100,000 website domains to scrape although in practice it turned out to be more than 200,000 websites because a lot of them errored or blocked the scraper.
- Run a [CSS Scraper](https://github.com/nl-design-system/theme-wizard/tree/main/packages/css-scraper) [(v1.0.2)](https://github.com/nl-design-system/theme-wizard/releases/tag/%40nl-design-system-community%2Fcss-scraper%401.0.2) to get the CSS for the homepage of each of those domains. Only homepages were analyzed, no deeper URL's. All CSS is collected into a single string for analysis.
- Use [@projectwallace/css-analyzer](https://github.com/projectwallace/css-analyzer) ([v7.6.3](https://github.com/projectwallace/css-analyzer/releases/tag/v7.6.3)) to analyze the CSS
- Analysis is stored in a local SQLite database and SQL queries are used to gather unique values, medians, percentiles, min, max etc.
- No AI was used to write this content. If you think it's slop it's simply because I'm a lousy writer. Some AI was used to generate the SQL queries to generate the data but they were all checked by my human eyes.

All conclusions and opinions are mine, a mere mortal with an above average interest in looking at CSS in a different way than most people do. You may not agree and that's fine.
