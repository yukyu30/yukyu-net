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

    type CharDatum = {
      node: Text;
      index: number;
      original: string;
      y: number;
      revealed: boolean;
    };
    const charData: CharDatum[] = [];

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

    const msPerChar = 1000 / charsPerSecond; // 1文字あたりのミリ秒
    const startTime = performance.now();
    let currentIndex = 0;
    let rafId = 0;
    let scrollRevealIndex = 0;
    let scrollTriggered = false;

    // スクロールイベント: 現在のビューポート下端までを一気に開示対象にする
    const handleScroll = () => {
      scrollTriggered = true;
      const threshold = window.scrollY + window.innerHeight + 100;
      let idx = scrollRevealIndex;
      for (let i = idx; i < charData.length; i++) {
        if (charData[i].y <= threshold) {
          idx = i + 1;
        } else {
          break;
        }
      }
      if (idx > scrollRevealIndex) {
        scrollRevealIndex = idx;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    // 既にスクロール済み（アンカーリンク等）の場合は初期位置まで開示
    if (window.scrollY > 0) {
      handleScroll();
    }

    // アニメーションループ
    const animate = () => {
      const elapsed = performance.now() - startTime;
      // 時間ベースの開示インデックス
      const timeBasedIndex = Math.floor(elapsed / msPerChar);
      // スクロールで到達している位置 or 通常アニメーションの進行、大きい方に追従
      const targetIndex = Math.min(
        charData.length,
        Math.max(timeBasedIndex, scrollTriggered ? scrollRevealIndex : 0)
      );

      // targetIndexまでを順番に開示
      while (currentIndex < targetIndex) {
        const data = charData[currentIndex];
        if (!data.revealed && data.node.textContent) {
          const chars = data.node.textContent.split('');
          chars[data.index] = data.original;
          data.node.textContent = chars.join('');
          data.revealed = true;
        }
        currentIndex++;
      }

      // 未開示の先頭付近にグリッチ効果
      const glitchRange = Math.min(30, charData.length - currentIndex);
      for (let i = 0; i < glitchRange; i++) {
        if (Math.random() < 0.3) {
          const data = charData[currentIndex + i];
          if (!data.revealed && data.node.textContent) {
            const chars = data.node.textContent.split('');
            chars[data.index] = getRandomChar();
            data.node.textContent = chars.join('');
          }
        }
      }

      if (currentIndex >= charData.length) {
        setIsRevealed(true);
        return;
      }

      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafId);
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
