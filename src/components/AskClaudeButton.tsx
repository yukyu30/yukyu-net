'use client';

import { useEffect, useState } from 'react';

export default function AskClaudeButton() {
  const [claudeUrl, setClaudeUrl] = useState('');

  useEffect(() => {
    const prompt = `以下のブログを読んで質問に答えて ${window.location.href}`;
    setClaudeUrl(`https://claude.ai/new?q=${encodeURIComponent(prompt)}`);
  }, []);

  if (!claudeUrl) {
    return null;
  }

  return (
    <a
      href={claudeUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-block text-sm font-mono text-green-600 hover:text-green-400 transition-colors mt-4"
    >
      [claudeに聞く]
    </a>
  );
}
