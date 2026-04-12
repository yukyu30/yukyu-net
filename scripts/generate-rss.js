const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const siteConfig = require('../src/config/site.json');

const postsDirectory = path.join(process.cwd(), 'public', 'source');
const publicPath = path.join(process.cwd(), 'public');

function escapeXML(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function cleanText(text) {
  return text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
}

function getAllPosts() {
  const excludeDirs = ['README', 'me', 'privacy-policy'];
  
  const directories = fs.readdirSync(postsDirectory)
    .filter(dir => {
      const fullPath = path.join(postsDirectory, dir);
      return fs.statSync(fullPath).isDirectory() && !excludeDirs.includes(dir);
    });

  const posts = directories.map(dir => {
    const slug = dir;
    const indexPath = path.join(postsDirectory, dir, 'index.md');
    
    if (!fs.existsSync(indexPath)) {
      return null;
    }

    const fileContents = fs.readFileSync(indexPath, 'utf8');
    const { data, content } = matter(fileContents);

    const excerpt = content
      .replace(/^#+\s+/gm, '')
      .replace(/!\[.*?\]\(.*?\)/g, '')
      .replace(/\[.*?\]\(.*?\)/g, '')
      .substring(0, 200)
      .trim() + '...';

    return {
      slug,
      title: data.title || slug,
      date: data.date || slug,
      excerpt: data.excerpt || excerpt,
      rss: data.rss !== false,
    };
  }).filter(post => post !== null);

  return posts.sort((a, b) => {
    const getDateFromSlug = (slug) => {
      const match = slug.match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (match) {
        return new Date(match[1] + '-' + match[2] + '-' + match[3]);
      }
      return new Date(0);
    };
    
    const dateA = a.date !== a.slug ? new Date(a.date) : getDateFromSlug(a.slug);
    const dateB = b.date !== b.slug ? new Date(b.date) : getDateFromSlug(b.slug);
    
    return dateB.getTime() - dateA.getTime();
  });
}

function generateRSSFeed() {
  const posts = getAllPosts().filter(post => post.rss !== false);
  const siteUrl = process.env.SITE_URL || 'https://yukyu.net';
  const feedUrl = `${siteUrl}/rss.xml`;

  const rssItems = posts.slice(0, 20).map(post => {
    const postUrl = `${siteUrl}/posts/${post.slug}`;
    const pubDate = new Date(post.date).toUTCString();
    
    const cleanTitle = cleanText(post.title);
    const cleanExcerpt = cleanText(post.excerpt);
    const safeTitle = escapeXML(cleanTitle);
    const safeExcerpt = escapeXML(cleanExcerpt);
    
    return `
    <item>
      <title>${safeTitle}</title>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <description>${safeExcerpt}</description>
      <pubDate>${pubDate}</pubDate>
    </item>`;
  }).join('');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${siteConfig.name}</title>
    <link>${siteUrl}</link>
    <description>yukyu's thoughts and digital archive</description>
    <language>ja</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml"/>
    ${rssItems}
  </channel>
</rss>`;

  return rss;
}

// RSSフィードを生成してファイルに書き込む
const rss = generateRSSFeed();
const rssPath = path.join(publicPath, 'rss.xml');
fs.writeFileSync(rssPath, rss, 'utf-8');
console.log('RSS feed generated at public/rss.xml');