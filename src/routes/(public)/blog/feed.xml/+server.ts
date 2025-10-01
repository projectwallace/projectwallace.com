import { getPostList, type Post } from '$lib/blog'

export const prerender = true

function createFeed(posts: Post[]) {
  return `<?xml version="1.0" encoding="utf-8"?>
  <rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom">
    <channel>
      <title>Project Wallace Blog</title>
      <link>https://www.projectwallace.com/blog</link>
      <description>You want to learn more about the workings of Wallace? You came to the right place! Product updates, in depth analysis and more.</description>
      <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
      <language>en</language>
      <docs>https://validator.w3.org/feed/docs/rss2.html</docs>
      <generator>manual</generator>
      <atom:link href="https://www.projectwallace.com/blog/feed.xml" rel="self" type="application/rss+xml"/>
      ${posts.map((post) => `
        <item>
          <guid>https://www.projectwallace.com/${post.path}</guid>
          <link>https://www.projectwallace.com${post.path}?utm_source=rss</link>
          <title><![CDATA[${post.title}]]></title>
          <description><![CDATA[${post.excerpt}]]></description>
          <content:encoded><![CDATA[${post.html}]]></content:encoded>
          <pubDate>${post.date.toUTCString()}</pubDate>
          <author>Bart Veneman</author>
        </item>
      `).join('')}
    </channel>
  </rss>`
}

export function GET() {
  const posts = getPostList()
  const feed = createFeed(posts)

  return new Response(feed, {
    headers: {
      'cache-control': `max-age=0, s-max-age=3600`,
      'content-type': 'application/xml',
    }
  })
}
