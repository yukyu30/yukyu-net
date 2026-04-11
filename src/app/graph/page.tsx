import { Metadata } from 'next';
import ArticleGraph from '@/components/ArticleGraph';
import MenuBar from '@/components/MenuBar';
import siteConfig from '@/config/site.json';

export const metadata: Metadata = {
  title: `Article Graph | ${siteConfig.name}`,
  description: '記事間の関連性を可視化したインタラクティブグラフ',
};

export default function GraphPage() {
  return (
    <div className="min-h-screen bg-black text-green-400 flex flex-col">
      <MenuBar />

      <main className="flex-1 flex flex-col">
        <div className="border-b border-green-400 px-4 py-3">
          <h1 className="text-xl font-mono font-bold">ARTICLE GRAPH</h1>
          <p className="text-xs font-mono text-green-600 mt-1">
            記事間の関連性をベクトル類似度で可視化 | ノードをクリックで記事へ移動
          </p>
        </div>

        <div className="flex-1 min-h-0">
          <ArticleGraph />
        </div>
      </main>
    </div>
  );
}
