'use client';

import { useEffect, useState, useRef } from 'react';
import { gsap } from 'gsap';
import Link from 'next/link';
import MenuBar from '@/components/MenuBar';
import type { StatusResponse } from '@/types/status';
import siteConfig from '@/config/site.json';

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function StatusPage() {
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const heartRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    async function fetchStatus() {
      try {
        const response = await fetch('/api/status');
        if (!response.ok) {
          throw new Error('Failed to fetch status');
        }
        const data = await response.json();
        setStatus(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    }

    fetchStatus();
  }, []);

  useEffect(() => {
    if (!heartRef.current || !status?.is_alive) return;

    const heart = heartRef.current;

    const heartbeat = gsap.timeline({ repeat: -1 });
    heartbeat
      .to(heart, { scale: 1.2, duration: 0.15, ease: 'power2.out' })
      .to(heart, { scale: 1, duration: 0.15, ease: 'power2.in' })
      .to(heart, { scale: 1.15, duration: 0.1, ease: 'power2.out' })
      .to(heart, { scale: 1, duration: 0.3, ease: 'power2.in' })
      .to(heart, { scale: 1, duration: 0.6 });

    return () => {
      heartbeat.kill();
    };
  }, [status?.is_alive]);

  const latestSignal = status?.recent_signals[0];

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <MenuBar />

      <main className="flex-1 p-4">
        <div className="max-w-2xl mx-auto">
          {/* ヘッダー */}
          <div className="border-2 border-green-400 mb-4">
            <div className="border-b border-green-400 px-4 py-2 flex items-center justify-between">
              <span className="text-sm font-mono text-green-600">STATUS MONITOR</span>
              <Link
                href="/"
                className="text-sm font-mono text-green-600 hover:text-green-400"
              >
                [CLOSE]
              </Link>
            </div>

            {/* メインステータス */}
            <div className="p-8 flex flex-col items-center justify-center">
              {isLoading ? (
                <div className="text-center">
                  <div className="text-2xl font-mono text-green-600 animate-pulse">
                    CONNECTING...
                  </div>
                </div>
              ) : error ? (
                <div className="text-center">
                  <div className="text-6xl mb-4">
                    <span className="text-red-500">X</span>
                  </div>
                  <div className="text-2xl font-mono text-red-500">ERROR</div>
                  <div className="text-sm font-mono text-red-400 mt-2">{error}</div>
                </div>
              ) : status ? (
                <>
                  {/* ハートアイコン */}
                  <svg
                    ref={heartRef}
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className={`w-24 h-24 mb-6 ${
                      status.is_alive ? 'text-green-400' : 'text-red-500'
                    }`}
                    style={{ transformOrigin: 'center' }}
                  >
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>

                  <div
                    className={`text-4xl font-mono font-bold ${
                      status.is_alive ? 'text-green-400' : 'text-red-500'
                    }`}
                  >
                    {status.is_alive ? 'ALIVE' : 'OFFLINE'}
                  </div>
                  <div className="text-sm font-mono text-green-600 mt-2">
                    Last seen: {formatRelativeTime(status.last_seen_at)}
                  </div>
                  {latestSignal && (
                    <div className="text-xs font-mono text-green-600 mt-1">
                      &quot;{latestSignal.title}&quot;
                    </div>
                  )}
                </>
              ) : null}
            </div>
          </div>

          {/* シグナルタイムライン */}
          {status && status.recent_signals.length > 0 && (
            <div className="border-2 border-green-400">
              <div className="border-b border-green-400 px-4 py-2">
                <span className="text-sm font-mono text-green-600">TIMELINE</span>
              </div>
              <div className="divide-y divide-green-800">
                {status.recent_signals.map((signal) => (
                  <div key={signal.id} className="px-4 py-3 flex items-center justify-between">
                    <span className="text-sm font-mono text-green-400">{signal.title}</span>
                    <span className="text-xs font-mono text-green-600">
                      {formatRelativeTime(signal.created_at)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* フッター */}
      <footer className="border-t border-green-400 px-4 py-2 mt-4">
        <div className="text-center text-xs font-mono text-green-600">
          STATUS PAGE - {siteConfig.name}
        </div>
      </footer>
    </div>
  );
}
