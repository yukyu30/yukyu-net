'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LifeStatus } from './LifeStatus';
import type { StatusResponse } from '@/types/status';

export default function ProfileSection() {
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const socialLinks = [
    { name: 'X (Twitter)', url: 'https://x.com/yukyu30' },
    { name: 'BlueSky', url: 'https://bsky.app/profile/yukyu.net' },
    { name: 'GitHub', url: 'https://github.com/yukyu30' },
    { name: 'Zenn', url: 'https://zenn.dev/yu_9' },
    { name: 'Instagram', url: 'https://instagram.com/ugo_kun_930' },
    { name: 'SUZURI', url: 'https://suzuri.jp/yukyu30' },
    { name: 'Portfolio', url: 'https://foriio.com/yukyu30' },
    { name: 'YouTube', url: 'https://www.youtube.com/@yukyu30' },
    {
      name: 'VRChat',
      url: 'https://vrchat.com/home/user/usr_c3a3cf58-fbf3-420b-9eb2-c9b69d46b5d6',
    },
  ];

  return (
    <div className="border-b border-green-800 p-6">
      {/* プロフィール情報 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <span className="text-base font-mono text-green-600">NAME: </span>
          <span className="text-lg font-mono">yukyu</span>
          <Link
            href="/posts/me"
            className="ml-3 text-base text-green-600 hover:text-green-400"
          >
            [VIEW PROFILE]
          </Link>
        </div>
        <div>
          <span className="text-base font-mono text-green-600">ROLE: </span>
          <span className="text-lg font-mono">
            GMOペパボ / 事業開発部 / 上級VR技術者
          </span>
        </div>
      </div>

      {/* SNSリンク */}
      <div className="flex flex-wrap gap-3">
        {socialLinks.map((link) => (
          <Link
            key={link.name}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-base font-mono text-green-600 hover:text-green-400 transition-colors"
          >
            [{link.name}]
          </Link>
        ))}
      </div>
    </div>
  );
}
