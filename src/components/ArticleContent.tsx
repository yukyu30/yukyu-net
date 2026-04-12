'use client';

import { useEffect, useRef, useState } from 'react';

interface ArticleContentProps {
  content: string;
  charsPerSecond?: number; // 1秒あたりに復号する文字数
}

// 文字化け用のランダム文字
const GLITCH_CHARS = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン゛゜';

function getRandomChar(): string {
  return GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
}

export default function ArticleContent({
  content,
  charsPerSecond = 100, // デフォルト: 1秒あたり100文字復号
}: ArticleContentProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // マウント後にフラグを立てる
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!containerRef.current || isRevealed || !isMounted) return;

    const container = containerRef.current;

    // テキストノードを収集
    const textNodes: Text[] = [];
    const walker = document.createTreeWalker(
      container,
      NodeFilter.SHOW_TEXT,
      null
    );

    let node;
    while ((node = walker.nextNode())) {
      if (node.textContent && node.textContent.trim()) {
        textNodes.push(node as Text);
      }
    }

    // 各テキストノードの元のテキストと文字位置を保存
    const originalTexts = textNodes.map((node) => node.textContent || '');
    const charData: {
      node: Text;
      index: number;
      original: string;
      y: number;
      revealed: boolean;
    }[] = [];

    textNodes.forEach((node, nodeIndex) => {
      const text = originalTexts[nodeIndex];
      for (let i = 0; i < text.length; i++) {
        if (text[i] !== ' ' && text[i] !== '\n' && text[i] !== '\t') {
          charData.push({
            node,
            index: i,
            original: text[i],
            y: 0,
            revealed: false,
          });
        }
      }
    });

    // 初期状態: 文字化け
    textNodes.forEach((node, nodeIndex) => {
      const text = originalTexts[nodeIndex];
      let glitched = '';
      for (let i = 0; i < text.length; i++) {
        if (text[i] === ' ' || text[i] === '\n' || text[i] === '\t') {
          glitched += text[i];
        } else {
          glitched += getRandomChar();
        }
      }
      node.textContent = glitched;
    });

    // 文字化け適用後にY座標を計算（親要素ごとにキャッシュ）
    const parentYCache = new WeakMap<Element, number>();
    charData.forEach((data) => {
      const parent = data.node.parentElement;
      if (!parent) return;
      let y = parentYCache.get(parent);
      if (y === undefined) {
        const rect = parent.getBoundingClientRect();
        y = rect.top + window.scrollY;
        parentYCache.set(parent, y);
      }
      data.y = y;
    });

    const timeouts: NodeJS.Timeout[] = [];
    const msPerChar = 1000 / charsPerSecond; // 1文字あたりのミリ秒

    // 1文字を正しい文字に復号する
    const revealCharAt = (index: number) => {
      const data = charData[index];
      if (!data || data.revealed || !data.node.textContent) return;
      data.revealed = true;
      const chars = data.node.textContent.split('');
      chars[data.index] = data.original;
      data.node.textContent = chars.join('');
    };

    // 各文字のアニメーション（先頭から順番に復号）
    charData.forEach((data, charIndex) => {
      const baseRevealTime = charIndex * msPerChar;
      const randomOffset = (Math.random() - 0.5) * msPerChar * 2;
      const revealTime = Math.max(0, baseRevealTime + randomOffset);

      const glitchCount = Math.floor(Math.random() * 3) + 2;
      const glitchInterval = Math.min(revealTime / glitchCount, 50);

      // 文字化けアニメーション
      for (let i = 0; i < glitchCount; i++) {
        const glitchTime = revealTime - (glitchCount - i) * glitchInterval;
        if (glitchTime > 0) {
          timeouts.push(
            setTimeout(() => {
              if (!data.revealed && data.node.textContent) {
                const chars = data.node.textContent.split('');
                chars[data.index] = getRandomChar();
                data.node.textContent = chars.join('');
              }
            }, glitchTime)
          );
        }
      }

      // 正しい文字を表示
      timeouts.push(
        setTimeout(() => {
          revealCharAt(charIndex);
        }, revealTime)
      );
    });

    // スクロールイベント: ビューポート下端までの文字を一気に復号
    // 実際のスクロール位置が0のときは何もしない（初期ロード時の誤発火対策）
    const handleScroll = () => {
      if (window.scrollY <= 0) return;
      const threshold = window.scrollY + window.innerHeight + 100;
      for (let i = 0; i < charData.length; i++) {
        if (charData[i].y <= threshold) {
          revealCharAt(i);
        } else {
          break;
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    // 既にスクロール済み（アンカーリンク等）の場合は初期位置まで復号
    if (window.scrollY > 0) {
      handleScroll();
    }

    // アニメーション完了後
    const totalDuration = charData.length * msPerChar + 500;
    timeouts.push(
      setTimeout(() => {
        setIsRevealed(true);
      }, totalDuration)
    );

    return () => {
      timeouts.forEach((timeout) => clearTimeout(timeout));
      window.removeEventListener('scroll', handleScroll);
    };
  }, [content, charsPerSecond, isRevealed, isMounted]);

  return (
    <div
      ref={containerRef}
      className="article-content max-w-none"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
