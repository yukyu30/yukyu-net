import * as pagefind from 'pagefind';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourceDir = path.join(process.cwd(), 'contents');
const outputDir = path.join(process.cwd(), 'public', 'pagefind');

const excludeDirs = ['README', 'me', 'privacy-policy'];

async function generateSearchIndex() {
  console.log('Generating search index...');

  const { index } = await pagefind.createIndex({});

  if (!index) {
    console.error('Failed to create index');
    process.exit(1);
  }

  const slugs = fs.readdirSync(sourceDir).filter(slug => {
    const fullPath = path.join(sourceDir, slug);
    if (!fs.statSync(fullPath).isDirectory()) return false;
    if (excludeDirs.includes(slug)) return false;
    const indexPath = path.join(sourceDir, slug, 'index.md');
    return fs.existsSync(indexPath);
  });

  console.log(`Found ${slugs.length} posts`);

  for (const slug of slugs) {
    const filePath = path.join(sourceDir, slug, 'index.md');
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(fileContent);

    const tags = data.tags || [];
    const tagsText = tags.join(' ');

    const title = data.title || slug;

    const htmlContent = `
      <html>
        <head>
          <title>${title}</title>
        </head>
        <body data-pagefind-body>
          <h1 data-pagefind-meta="title" data-pagefind-weight="10">${title}</h1>
          <p data-pagefind-meta="tags" data-pagefind-weight="5">${tagsText}</p>
          <p data-pagefind-meta="date" data-pagefind-ignore>${data.created_at || slug}</p>
          <article>
            ${content}
          </article>
        </body>
      </html>
    `;

    await index.addHTMLFile({
      url: `/posts/${slug}`,
      content: htmlContent,
    });
  }

  await index.writeFiles({
    outputPath: outputDir,
  });

  console.log(`Search index written to ${outputDir}`);
}

generateSearchIndex().catch(err => {
  console.error('Failed to generate search index:', err);
  process.exit(1);
});
