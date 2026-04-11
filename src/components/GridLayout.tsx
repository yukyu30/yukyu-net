'use client'

import { ReactNode, useState, useEffect } from 'react';
import MenuBar from './MenuBar';
import StatusBar from './StatusBar';
import WindowFrame from './WindowFrame';
import ProfileSection from './ProfileSection';
import BootSequence from './BootSequence';
import siteConfig from '@/config/site.json';

interface GridLayoutProps {
  children: ReactNode;
  postsCount?: number;
  lastUpdate?: string;
  showProfile?: boolean;
  currentTag?: string;
  pagination?: ReactNode;
}

export default function GridLayout({
  children,
  postsCount,
  lastUpdate,
  showProfile = false,
  currentTag,
  pagination,
}: GridLayoutProps) {
  const [bootComplete, setBootComplete] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [shouldShowBoot, setShouldShowBoot] = useState(false);

  const windowTitle = currentTag
    ? `TAG: #${currentTag}`
    : siteConfig.name;

  // クライアントサイドでマウント完了を検知し、BootSequence表示判定
  useEffect(() => {
    setMounted(true);

    // セッション中に既にBootSequenceを表示済みかチェック
    const hasBooted = sessionStorage.getItem('decoboco-booted');

    if (hasBooted) {
      // 既に表示済みの場合はスキップ
      setBootComplete(true);
      setShowContent(true);
    } else {
      // 初回アクセスの場合はBootSequenceを表示
      setShouldShowBoot(true);
    }
  }, []);

  const handleBootComplete = () => {
    sessionStorage.setItem('decoboco-booted', 'true');
    setBootComplete(true);
    // 少し遅延してからコンテンツ表示
    setTimeout(() => setShowContent(true), 100);
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* ブートシーケンス（外部からのアクセス時のみ） */}
      {mounted && shouldShowBoot && !bootComplete && <BootSequence onComplete={handleBootComplete} />}

      {/* メニューバー */}
      <MenuBar />

      {/* メインウィンドウ */}
      <main className="flex-1 p-4">
        <WindowFrame title={windowTitle}>
          {/* タグ情報 */}
          {currentTag && (
            <div className="px-4 py-3">
              <p className="text-sm font-mono text-green-600">
                {postsCount} {postsCount === 1 ? 'ARTICLE' : 'ARTICLES'} FOUND
              </p>
            </div>
          )}

          {/* プロフィール */}
          {showProfile && <ProfileSection />}

          {/* 記事グリッド */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
            {showContent && children}
          </div>

          {/* ページネーション */}
          {pagination && (
            <div className="border-t border-green-400">
              {pagination}
            </div>
          )}
        </WindowFrame>
      </main>

      {/* ステータスバー */}
      <StatusBar
        postsCount={postsCount}
        lastUpdate={lastUpdate}
        status={currentTag ? `VIEWING TAG: #${currentTag}` : 'READY'}
      />
    </div>
  );
}
