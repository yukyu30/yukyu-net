import 'dotenv/config';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const openai = new OpenAI();

const sourceDir = path.join(process.cwd(), 'contents');
const outputDir = path.join(process.cwd(), 'public', 'graph');
const cacheFile = path.join(outputDir, 'embeddings-cache.json');

const excludeDirs = ['README', 'me', 'privacy-policy'];

// コサイン類似度を計算
function cosineSimilarity(a, b) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// 記事を読み込み
function loadPosts() {
  const slugs = fs.readdirSync(sourceDir).filter(slug => {
    const fullPath = path.join(sourceDir, slug);
    if (!fs.statSync(fullPath).isDirectory()) return false;
    if (excludeDirs.includes(slug)) return false;
    const indexPath = path.join(sourceDir, slug, 'index.md');
    return fs.existsSync(indexPath);
  });

  return slugs.map(slug => {
    const filePath = path.join(sourceDir, slug, 'index.md');
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(fileContent);

    const tags = data.tags || [];
    const title = data.title || slug;

    // 埋め込み用のテキスト（タイトル + タグ + 本文の先頭500文字）
    const text = `${title}\n\nタグ: ${tags.join(', ')}\n\n${content.slice(0, 500)}`;

    return {
      slug,
      title,
      tags,
      date: data.created_at || slug,
      text,
    };
  });
}

// キャッシュを読み込み
function loadCache() {
  if (fs.existsSync(cacheFile)) {
    return JSON.parse(fs.readFileSync(cacheFile, 'utf-8'));
  }
  return {};
}

// キャッシュを保存
function saveCache(cache) {
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(cacheFile, JSON.stringify(cache, null, 2));
}

// OpenAI APIで埋め込みを取得（バッチ処理）
async function getEmbeddings(posts, cache) {
  const uncachedPosts = posts.filter(post => !cache[post.slug]);

  if (uncachedPosts.length === 0) {
    console.log('All embeddings are cached');
    return cache;
  }

  console.log(`Generating embeddings for ${uncachedPosts.length} posts...`);

  // バッチサイズ（OpenAI APIの制限に合わせる）
  const batchSize = 100;

  for (let i = 0; i < uncachedPosts.length; i += batchSize) {
    const batch = uncachedPosts.slice(i, i + batchSize);
    const texts = batch.map(post => post.text);

    try {
      const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: texts,
      });

      for (let j = 0; j < batch.length; j++) {
        cache[batch[j].slug] = response.data[j].embedding;
      }

      console.log(`Processed ${Math.min(i + batchSize, uncachedPosts.length)}/${uncachedPosts.length}`);

      // レート制限対策
      if (i + batchSize < uncachedPosts.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (err) {
      console.error('Error generating embeddings:', err);
      throw err;
    }
  }

  saveCache(cache);
  return cache;
}

// グラフデータを生成
function generateGraphData(posts, embeddings) {
  const nodes = posts.map(post => ({
    id: post.slug,
    name: post.title,
    tags: post.tags,
    date: post.date,
    url: `/posts/${post.slug}`,
    // 主要タグで色分け用のグループ
    group: post.tags[0] || 'other',
  }));

  // エッジを生成（類似度が閾値以上のペア）
  const edges = [];
  const similarityThreshold = 0.6; // 類似度の閾値
  const maxEdgesPerNode = 5; // 各ノードからの最大エッジ数

  for (let i = 0; i < posts.length; i++) {
    const similarities = [];

    for (let j = 0; j < posts.length; j++) {
      if (i === j) continue;

      const similarity = cosineSimilarity(
        embeddings[posts[i].slug],
        embeddings[posts[j].slug]
      );

      if (similarity >= similarityThreshold) {
        similarities.push({
          target: posts[j].slug,
          similarity,
        });
      }
    }

    // 類似度の高い順にソートして上位N件を取得
    similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, maxEdgesPerNode)
      .forEach(({ target, similarity }) => {
        // 重複エッジを避ける
        const existingEdge = edges.find(
          e => (e.source === posts[i].slug && e.target === target) ||
               (e.source === target && e.target === posts[i].slug)
        );
        if (!existingEdge) {
          edges.push({
            source: posts[i].slug,
            target,
            value: similarity,
          });
        }
      });
  }

  return { nodes, links: edges };
}

// メイン処理
async function main() {
  console.log('Loading posts...');
  const posts = loadPosts();
  console.log(`Found ${posts.length} posts`);

  console.log('Loading cache...');
  let cache = loadCache();

  console.log('Generating embeddings...');
  cache = await getEmbeddings(posts, cache);

  console.log('Generating graph data...');
  const graphData = generateGraphData(posts, cache);

  console.log(`Generated ${graphData.nodes.length} nodes and ${graphData.links.length} edges`);

  // グラフデータを保存
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(
    path.join(outputDir, 'graph-data.json'),
    JSON.stringify(graphData, null, 2)
  );

  console.log(`Graph data written to ${outputDir}/graph-data.json`);
}

main().catch(err => {
  console.error('Failed to generate graph data:', err);
  process.exit(1);
});
